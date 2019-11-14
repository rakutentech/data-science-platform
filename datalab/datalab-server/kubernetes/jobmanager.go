package kubernetes

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"math/rand"
	"os"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/auth"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/utils"
	"github.com/astaxie/beego/logs"
	batch "k8s.io/api/batch/v1"
	api "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/util/yaml"
)

type JobManager struct {
	stop    chan int
	started bool
}

var sharedInstance = &JobManager{
	stop: make(chan int),
}

func GetJobManager() *JobManager {
	return sharedInstance
}

func (c *JobManager) getGID() uint64 {
	b := make([]byte, 64)
	b = b[:runtime.Stack(b, false)]
	b = bytes.TrimPrefix(b, []byte("goroutine "))
	b = b[:bytes.IndexByte(b, ' ')]
	n, _ := strconv.ParseUint(string(b), 10, 64)
	return n
}

func (c *JobManager) CreateJob(instance models.FunctionInstance, instanceType models.InstanceType, user models.User, request models.JobRequest) (job *models.JobInstance, err error) {

	jobID := models.GenerateUUID(models.JobInstance{}, instance.Name, user.Username)
	jsonData, err := json.Marshal(request)
	if err != nil {
		logs.Warn("Cannot parse api request:%s", err.Error())
	}
	job = &models.JobInstance{
		JobID:            jobID,
		UUID:             instance.UUID,
		Owner:            user.Username,
		InstanceName:     instance.Name,
		InstanceTypeName: instanceType.Name,
		InstanceNumber:   1,
		Namespace:        user.Namespace,
		Parameters:       string(jsonData),
		CreateAt:         time.Now().Unix(),
		Status:           models.Pending,
	}
	return job, err
}

func (c *JobManager) RegisterJob(job *models.JobInstance) (err error) {
	manager := models.NewModelManager(models.JobInstance{})
	err = manager.Create(job)
	if err != nil {
		return err
	}
	return
}

func (c *JobManager) UnregisterJob(instance models.FunctionInstance) (err error) {
	manager := models.NewModelManager(models.JobInstance{})
	// Remove job logs
	var jobInstances []*models.JobInstance
	manager.FindInstances(map[string]interface{}{
		"u_u_i_d": instance.UUID,
		"owner":   instance.Owner,
	}, &jobInstances)

	for _, job := range jobInstances {
		logs.Info("UnregisterJob: [%s]", job.JobID)

		if job.Status == models.Pending || job.Status == models.Running {
			err = DeleteJobAndPod(job)
			if err != nil {
				return err
			}
		}

		jobLogPath := c.GetJobLogRootPath(job)
		_, err := os.Stat(jobLogPath)
		if !os.IsNotExist(err) {
			logs.Info("Remove log path: [%s]", jobLogPath)
			err = os.RemoveAll(jobLogPath)
			if err != nil {
				return err
			}
		}
	}

	//Clear job records
	err = manager.DeleteWhere("`job_instance`", fmt.Sprintf("u_u_i_d='%s'", instance.UUID))
	return err
}

func (c *JobManager) Start() {

	if !c.started {
		c.started = true
		go func() {
			ticker := time.NewTicker(10 * time.Second)
		LOOP:
			// This loop is single process
			// if TrackJob be executed over 1 second, JobManager will wait it
			for {
				select {
				case <-ticker.C:
					c.TrackJobs()
				case <-c.stop:
					ticker.Stop()
					break LOOP
				}
			}
		}()
		go func() {
			ticker := time.NewTicker(1 * time.Hour)
		LOOP:
			// This loop is single process
			// if TrackJob be executed over 1 second, JobManager will wait it
			for {
				select {
				case <-ticker.C:
					c.CleanExpiredJob()
				case <-c.stop:
					ticker.Stop()
					break LOOP
				}
			}
		}()
	}
}

func (c *JobManager) KillJob(job *models.JobInstance) (err error) {
	logs.Info(fmt.Sprintf("Killed job: [%s]", job.JobID))
	manager := models.NewModelManager(models.JobInstance{})
	job.Status = models.Killed
	job.FinishAt = time.Now().Unix()
	job.Duration = float64(time.Now().Unix() - job.CreateAt)
	manager.Update(job)

	podList := FetchPods(job.Namespace)
	pods, err := c.GetJobPodList(job, podList)
	if err == nil {
		logBytes, err := fetchJobAllPodLog(pods)
		if err != nil {
			logs.Error(err.Error())
			logBytes = []byte(fmt.Sprintf("Cannot fetch log of job [%s]", job.JobID))
		}
		c.SaveJobLog(job, logBytes)
		if err != nil {
			logs.Warn(fmt.Sprintf("Cannot save log [%s], skipped!", job.JobID))
		}
	}
	err = DeleteJobAndPod(job)
	return err
}

func (c *JobManager) CleanExpiredJob() {
	nowDate := time.Now().Unix()
	manager := models.NewModelManager(models.JobInstance{})
	var jobInstances []*models.JobInstance
	manager.All(&jobInstances)
	for _, job := range jobInstances {
		if time.Duration(nowDate-job.CreateAt)*time.Second > app.GetConfig().JobHistoryExpire {
			logPath := fmt.Sprintf("%s/%s", c.GetJobLogRootPath(job), job.JobID)
			logs.Info(fmt.Sprintf("Job [%s] is expired [%s], clear it. LogPath=[%s]",
				job.JobID,
				app.GetConfig().JobHistoryExpire,
				logPath))
			err := os.RemoveAll(logPath)
			if err == nil {
				manager.Delete(job)
			} else {
				logs.Error(err.Error())
			}
		}
	}
}

func existCompletedPod(podList []*api.Pod) bool {
	for _, pod := range podList {
		if pod.Status.Phase == api.PodSucceeded || pod.Status.Phase == api.PodFailed {
			return true
		}
	}
	return false
}

func (c *JobManager) generateLockName(job *models.JobInstance) string {
	return fmt.Sprintf("%s-%d", job.JobID, time.Now().UnixNano())
}

/**
  checkAndLockJob create a lock on a share disk which is shared durining processes
  The disk have to be visible for all processes
  Lock and process is 1-1 relation
  A process create a lock, and that lock will be removed by the process as well
*/
func (c *JobManager) checkAndLockJob(job *models.JobInstance, lockName string) bool {
	if job.Status != models.Pending &&
		job.Status != models.Running {
		// job may be handled by other process
		logs.Info("Job [%s] already be handled by other process", job.JobID)
		return false
	}
	lockPath := fmt.Sprintf("%s/lock", c.GetJobLogPath(job))
	err := os.MkdirAll(c.GetJobLogPath(job), os.ModePerm)
	if err != nil {
		logs.Error("Cannot make directory: [%s]", c.GetJobLogPath(job))
		return false
	}
	_, err = os.Stat(lockPath)
	if !os.IsNotExist(err) {
		data, err := ioutil.ReadFile(lockPath)
		lockContext := string(data)
		if err == nil && lockContext == lockName {
			return true
		}
		logs.Warn("Differet job [%s] lock name, [%s] != [%s]", lockPath, lockContext, lockName)
		lockTimestampArray := strings.Split(lockContext, "-")
		lockTimestamp, err := strconv.Atoi(lockTimestampArray[len(lockTimestampArray)-1])
		if err == nil {
			diffSeconds := (time.Now().UnixNano() - int64(lockTimestamp)) / 1000000000
			if diffSeconds > 300 {
				logs.Warn("Lock alive=[%d seconds] [%s] expired, re-create lock", diffSeconds, lockContext)
				return createLock(lockPath, lockName)
			}
		}
		return false
	} else {
		return createLock(lockPath, lockName)
	}
}

func createLock(lockPath, lockName string) bool {
	logs.Info("Create job lock: [%s]-[%s]", lockPath, lockName)
	err := utils.ApplyFile([]byte(lockName), lockPath)
	if err != nil {
		logs.Error("Cannot create job lock: [%s]-[%s]", lockPath, lockName)
		return false
	}
	return true
}

// removeJobLock make sure a lock be removed after checking job status
func (c *JobManager) removeJobLock(job *models.JobInstance, lockName string) {
	lockPath := fmt.Sprintf("%s/lock", c.GetJobLogPath(job))
	data, err := ioutil.ReadFile(lockPath)
	if err == nil {
		lockContext := string(data)
		if lockContext == lockName {
			logs.Info("Remove job lock: [%s]-[%s]", lockPath, lockName)
			os.Remove(lockPath)
		} else {
			logs.Info("Differet job [%s]  lock name, [%s] != [%s]", lockPath, lockContext, lockName)
		}
	}
}

func (c *JobManager) TrackJobs() {
	manager := models.NewModelManager(models.JobInstance{})
	var runningJobInstances []*models.JobInstance
	var pendingJobInstances []*models.JobInstance
	manager.FindInstances(map[string]interface{}{
		"status": models.Running,
	}, &runningJobInstances)
	manager.FindInstances(map[string]interface{}{
		"status": models.Pending,
	}, &pendingJobInstances)

	var podListMap = make(map[string]*api.PodList)
	nowDate := time.Now().Unix()

	targetJobs := append(runningJobInstances, pendingJobInstances...)
	// Shuffle targetJobs
	// We suppose the same targetJobs will be handled by multiple process in the same time
	// Each process handle out-of-order targetJobs to reduce conflict
	rand.Seed(time.Now().UnixNano())
	rand.Shuffle(len(targetJobs), func(i, j int) { targetJobs[i], targetJobs[j] = targetJobs[j], targetJobs[i] })

	for _, candidateJob := range targetJobs {
		// Check job status againg
		var job models.JobInstance
		err := manager.FindOne(map[string]interface{}{
			"job_id": candidateJob.JobID,
			"owner":  candidateJob.Owner,
		}, &job)
		if err != nil {
			logs.Warn("Cannot find candidate job: [%s]", job.JobID)
			continue
		}

		lockName := c.generateLockName(&job)
		if !c.checkAndLockJob(&job, lockName) {
			continue
		}

		logs.Info("Checking job status: [%s]", job.JobID)

		jobStatus := FetchJob(job.Namespace, job.JobID)
		if jobStatus.Name == "" {
			/*
				Sometime k8s backend may be unavailable, then job status will be unknown
				The strategy is we don't do anything, server may be restarted and still retry it
			*/
			logs.Warn("Cannot fetch job status information: [%s]", job.JobID)
			c.removeJobLock(&job, lockName)
			continue
		}

		if job.Status == models.Pending && jobStatus.Status.Active > 0 {
			// Change status, Pending -> Running
			if _, ok := podListMap[job.Namespace]; !ok {
				podListMap[job.Namespace] = FetchPods(job.Namespace)
			}
			pods, _ := c.GetJobPodList(&job, podListMap[job.Namespace])
			if len(pods) > 0 {
				for _, pod := range pods {
					if pod.Status.Phase == api.PodRunning {
						logs.Info("Job [%s] is running...", job.JobID)
						job.Status = models.Running
						manager.Update(&job)
					}
				}
			}
		} else if jobStatus.Status.Active == 0 || jobStatus.Status.Failed > 0 {
			// Change status, Running -> Success| Failed
			if _, ok := podListMap[job.Namespace]; !ok {
				podListMap[job.Namespace] = FetchPods(job.Namespace)
			}
			duration := nowDate - job.CreateAt
			expired := duration > 86400 // 1 days
			var logBytes []byte
			pods, err := c.GetJobPodList(&job, podListMap[job.Namespace])
			if len(pods) == 0 {
				if err != nil {
					logs.Warn(err.Error())
				} else {
					logs.Warn("Cannot find any pod of job [%s]", job.JobID)
				}
				if expired {
					logs.Warn("Pods creation of job [%s] is expired. Duration=[%d]", job.JobID, duration)
					logBytes = []byte(fmt.Sprintf("Pods creation of job [%s] is expired. Duration=[%d]", job.JobID, duration))
				} else {
					c.removeJobLock(&job, lockName)
					continue
				}
			} else {
				if !existCompletedPod(pods) && !expired {
					logs.Warn("Cannot find any completed pod of job [%s]", job.JobID)
					c.removeJobLock(&job, lockName)
					continue
				}
				if expired {
					logs.Warn("Abort job [%s]. Duration=[%d]", job.JobID, duration)
				}
				logBytes, err = fetchJobAllPodLog(pods)
				if err != nil {
					logs.Error(err.Error())
					logBytes = []byte(fmt.Sprintf("Cannot fetch log of job [%s]", job.JobID))
				}
			}

			// Check job again when try to update job status for avoiding race condition
			if !c.checkAndLockJob(&job, lockName) {
				continue
			}

			err = c.SaveJobLog(&job, logBytes)
			if err != nil {
				logs.Error(err.Error())
			}
			err = DeleteJobAndPod(&job)
			if err == nil {
				if jobStatus.Status.Succeeded > 0 {
					job.Status = models.Success
				} else if jobStatus.Status.Failed > 0 {
					job.Status = models.Failed
				} else {
					job.Status = models.Unknown
				}
				logs.Info("Removed job: [%s], status=%s", job.JobID, job.Status)
				if jobStatus.Status.CompletionTime != nil && jobStatus.Status.StartTime != nil {
					job.Duration = jobStatus.Status.CompletionTime.Time.Sub(jobStatus.Status.StartTime.Time).Seconds()
				} else {
					job.Duration = float64(duration)
				}

				job.FinishAt = nowDate
				manager.Update(&job)
			} else {
				logs.Error(err.Error())
			}
		}
		c.removeJobLock(&job, lockName)
	}

}

func (c *JobManager) SaveJobLog(job *models.JobInstance, logBytes []byte) (err error) {

	err = os.MkdirAll(c.GetJobLogPath(job), os.ModePerm)
	if err != nil {
		return err
	}
	path := fmt.Sprintf("%s/log", c.GetJobLogPath(job))
	logs.Info(fmt.Sprintf("Save job log to [%s]", path))
	err = utils.ApplyFile(logBytes, path)
	return err
}

func fetchJobAllPodLog(podList []*api.Pod) (b []byte, err error) {
	result := ""
	allPodError := true
	for _, pod := range podList {
		b, err = GetPodLog(*pod)
		if err != nil {
			result = fmt.Sprintf("%s\nPod: [%s]\n-------\n%s", result, pod.Name, err.Error())
		} else {
			allPodError = false
			result = fmt.Sprintf("%s\nPod: [%s]\n-------\n%s", result, pod.Name, string(b))
		}
	}
	if allPodError {
		return []byte(result), fmt.Errorf("Cannot fetch any pod log")
	} else {
		return []byte(result), nil
	}
}

func (c *JobManager) GetJobLogRootPath(job *models.JobInstance) string {
	return fmt.Sprintf("%s/jobs/%s/%s/%s",
		app.GetConfig().DataPath,
		job.Namespace,
		job.Owner,
		job.UUID)
}

func (c *JobManager) GetJobLogPath(job *models.JobInstance) string {
	return fmt.Sprintf("%s/%s",
		c.GetJobLogRootPath(job),
		job.JobID)
}

func (c *JobManager) GetJobPodList(job *models.JobInstance, podList *api.PodList) (resultList []*api.Pod, err error) {
	matcher := NewPodMatcher(job.JobID)
	for _, pod := range podList.Items {
		if matcher.MatchJobID(pod) {
			tempPod := pod // Avoid, memory address error
			resultList = append(resultList, &tempPod)
		}
	}
	if len(resultList) == 0 {
		return resultList, fmt.Errorf("Cannot find job pod [%s]", job.JobID)
	} else {
		return resultList, nil
	}
}

func (c *JobManager) FindJob(jobID, username string) (job models.JobInstance, err error) {
	manager := models.NewModelManager(models.JobInstance{})
	err = manager.FindOne(map[string]interface{}{
		"job_id": jobID,
		"owner":  username,
	}, &job)
	return job, err
}

func (c *JobManager) GetJobLog(job *models.JobInstance) string {
	if job.Status == models.Running || job.Status == models.Pending {
		podList := FetchPods(job.Namespace)
		pods, err := c.GetJobPodList(job, podList)
		if err != nil {
			logs.Error(err.Error())
			return ""
		}
		data, err := fetchJobAllPodLog(pods)
		if err == nil {
			return string(data)
		} else {
			logs.Error(err.Error())
			return ""
		}
	} else {
		path := fmt.Sprintf("%s/log", c.GetJobLogPath(job))
		_, err := os.Stat(path)
		if os.IsNotExist(err) {
			return ""
		} else {
			data, err := ioutil.ReadFile(path)
			if err == nil {
				return string(data)
			} else {
				logs.Error(err.Error())
				return ""
			}
		}
	}
}

func SubmitJob(instance models.FunctionInstance,
	setting models.FunctionSetting,
	instanceTypes []*models.InstanceType,
	request models.JobRequest,
	user models.User) (jobID string, err error) {

	var instanceType models.InstanceType
	targetInstanceType := instance.InstanceTypeName
	if len(request.InstanceTypeName) > 0 {
		targetInstanceType = request.InstanceTypeName
	}
	for _, accessibleInstanceType := range instanceTypes {
		if instanceType.ID == 0 {
			if accessibleInstanceType.Name == targetInstanceType {
				instanceType = *accessibleInstanceType
			}
		}
	}
	if instanceType.ID == 0 {
		return "", fmt.Errorf("Cannot find instance type: %s", targetInstanceType)
	}
	job, err := GetJobManager().CreateJob(instance, instanceType, user, request)
	if err != nil {
		return "", err
	}
	jobID = job.JobID

	logs.Info(fmt.Sprintf("Register job [%s]", jobID))

	functionHandler := new(models.FunctionHandlerManager).NewFunctionHandlerManager(instance)
	functionContext := functionHandler.GetFunctionContext()
	templateParser := new(KubeTemplateParser)
	templateVariable := TemplateVariables{
		UUID:             instance.UUID,
		Username:         user.Username,
		UserGroup:        user.Group,
		UserToken:        new(auth.TokenManager).BuildUserToken(user, app.GetConfig().TokenKey),
		Namespace:        user.Namespace,
		InstanceName:     instance.Name,
		InstanceType:     instanceType.Name,
		InstanceNumber:   instance.InstanceNumber,
		CPU:              fmt.Sprintf("%dm", int64(instanceType.CPU*1000)),
		GPU:              fmt.Sprintf("%d", int64(instanceType.GPU)),
		Memory:           fmt.Sprintf("%d%s", instanceType.Memory, getResourceScaleString(instanceType.MemoryScale)),
		EphemeralStorage: "10Gi",
		FunctionContext:  new(models.TriggerManager).NewTriggerManager(&instance).BuildEncodedJSONContext(*functionContext, request),
		JobID:            jobID,
	}
	templateHandler := models.NewTemplateHandlerManager(&setting)
	jobTemplate := templateHandler.GetKubeJobTemplate().JobTemplate
	var jobRequest batch.Job
	jobTemplate = templateParser.Parse(jobTemplate, templateVariable)
	decoder := yaml.NewYAMLOrJSONDecoder(bytes.NewReader([]byte(jobTemplate)), 100)
	decoder.Decode(&jobRequest)

	err = CreateJob(&InstanceSpec{
		Job: jobRequest,
	})
	if err == nil {
		err = GetJobManager().RegisterJob(job)
	}

	return jobID, err
}
func (c *JobManager) Stop() {
	c.started = false
	close(c.stop)
}
