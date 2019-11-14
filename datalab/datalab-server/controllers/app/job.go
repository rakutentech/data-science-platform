package app

import (
	"encoding/json"
	"fmt"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/auth"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/kubernetes"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/utils"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/logs"
)

type JobController struct {
	beego.Controller
}

func (c *JobController) Get() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	instanceName := c.Ctx.Input.Param(":instancename")
	jobManager := models.NewModelManager(models.JobInstance{})
	var jobInstances []*models.JobInstance
	jobManager.FindInstances(map[string]interface{}{
		"owner":        user.Username,
		"InstanceName": instanceName,
	}, &jobInstances)
	c.Data["json"] = jobInstances
	c.ServeJSON()
}

func (c *JobController) GetJobDetail() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	instanceName := c.Ctx.Input.Param(":instancename")
	jobID := c.Ctx.Input.Param(":jobid")
	jobManager := models.NewModelManager(models.JobInstance{})
	var jobInstance models.JobInstance
	err := jobManager.FindOne(map[string]interface{}{
		"owner":        user.Username,
		"InstanceName": instanceName,
		"JobID":        jobID,
	}, &jobInstance)

	if err == nil {
		c.Data["json"] = jobInstance
	} else {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString("Cannot find job"))
	}
	c.ServeJSON()
}

func (c *JobController) GetJobLog() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	instanceName := c.Ctx.Input.Param(":instancename")
	jobID := c.Ctx.Input.Param(":jobid")
	manager := models.NewModelManager(models.JobInstance{})
	var targetInstance models.JobInstance
	err := manager.FindOne(map[string]interface{}{
		"owner":        user.Username,
		"InstanceName": instanceName,
		"JobID":        jobID,
	}, &targetInstance)
	if err == nil {

		c.Data["json"] = kubernetes.GetJobManager().GetJobLog(&targetInstance)
		c.ServeJSON()
	} else {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString("Cannot get instance"))
	}
}

func (c *JobController) KillJob() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	instanceName := c.Ctx.Input.Param(":instancename")
	jobID := c.Ctx.Input.Param(":jobid")

	var job models.JobInstance
	instanceManager := models.NewModelManager(models.JobInstance{})
	err := instanceManager.FindOne(map[string]interface{}{
		"owner":        user.Username,
		"InstanceName": instanceName,
		"JobID":        jobID,
	}, &job)
	if err != nil {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString("Cannot get instance"))
	} else {
		err = kubernetes.GetJobManager().KillJob(&job)
		if err == nil {
			c.Data["json"] = utils.HTTPSuccessJSON()
		} else {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString("Cannot kill job"))
		}
	}
	c.ServeJSON()
}

func (c *JobController) SubmitJob() {
	username := c.Ctx.Input.Param(":username")
	instanceName := c.Ctx.Input.Param(":instancename")
	logs.Info(fmt.Sprintf("%s was triggered by %s from %s", c.Ctx.Request.RequestURI, username, c.Ctx.Request.RemoteAddr))
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	if user.Username != username {
		logs.Warn("Unavailable job endpoint: %s != %s", username, user.Username)
		c.CustomAbort(400, utils.HTTPFailedJSONString("Unavailable job endpoint"))
		c.ServeJSON()
		return
	}

	manager := models.NewModelManager(models.FunctionInstance{})
	var targetInstance models.FunctionInstance
	err := manager.FindOne(map[string]interface{}{
		"name":    instanceName,
		"Trigger": models.EventTrigger,
		"owner":   user.Username,
	}, &targetInstance)

	if err != nil {
		logs.Warn("Unavailable job instance:", err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString("Unavailable job instance"))
	} else {
		var functionSetting models.FunctionSetting
		settingManager := models.NewModelManager(models.FunctionSetting{})
		settingManager.FindInstanceByName(targetInstance.FunctionName, &functionSetting)

		var request models.JobRequest
		json.Unmarshal(c.Ctx.Input.RequestBody, &request)

		instanceTypes := GetAccessibleInstanceTypes(user)

		jobID, err := kubernetes.SubmitJob(targetInstance, functionSetting, instanceTypes, request, user)
		if err != nil {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
		} else {
			c.Data["json"] = map[string]string{
				"status": "ok",
				"jobID":  jobID,
				"url":    fmt.Sprintf("/function/instances/event/%s/jobs/%s", targetInstance.Name, jobID),
			}
		}
	}
	c.ServeJSON()
}
