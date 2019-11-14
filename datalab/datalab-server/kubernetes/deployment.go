package kubernetes

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"reflect"
	"strings"
	"time"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/auth"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/astaxie/beego/logs"
	appsv1 "k8s.io/api/apps/v1"
	beta1 "k8s.io/api/extensions/v1beta1" //https://github.com/kubernetes/api/blob/master/extensions/v1beta1/types.go
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/util/yaml"

	batch "k8s.io/api/batch/v1"
	api "k8s.io/api/core/v1" //https://github.com/kubernetes/api/blob/master/core/v1/types.go
)

// LabInstanceSpec is for deployment
type InstanceSpec struct {
	Deployment appsv1.Deployment
	Service    api.Service
	Ingress    beta1.Ingress
	Job        batch.Job
}

func getResourceScaleString(scaleName string) (scale string) {

	if scaleName == "MiB" {
		scale = "Mi"
	} else if scaleName == "GiB" {
		scale = "Gi"
	} else {
		scale = "Mi"
		logs.Warn(fmt.Sprintf("Unavailable scale name:%s, set to MiB", scaleName))
	}
	return
}

func LoadInstanceSpec(instance interface{}, setting interface{}, instanceType *models.InstanceType, user models.User) *InstanceSpec {
	var templateVariable TemplateVariables
	var deploymentTemplate string
	var serviceTemplate string
	var ingressTemplate string
	templateParser := new(KubeTemplateParser)

	switch setting.(type) {
	case *models.LabSetting:
		labInstance := instance.(*models.LabInstance)
		labSetting := setting.(*models.LabSetting)
		kubeDeploymentTemplate := models.NewTemplateHandlerManager(labSetting).GetKubeDeploymentTemplate()
		u, err := url.Parse(labSetting.LoadBalancer)
		var loadBalancer string
		if err == nil {
			loadBalancer = u.Hostname()
		}
		instanceTagsHandler := models.NewTagsHandlerManager(labInstance)
		instanceTypeTagsHandler := models.NewTagsHandlerManager(instanceType)
		templateVariable = TemplateVariables{
			UUID:             labInstance.UUID,
			Username:         user.Username,
			UserGroup:        user.Group,
			UserToken:        new(auth.TokenManager).BuildUserToken(user, app.GetConfig().TokenKey),
			Namespace:        labInstance.Namespace,
			LoadBalancer:     loadBalancer,
			InstanceNumber:   1,
			InstanceName:     labInstance.Name,
			InstanceType:     labInstance.InstanceTypeName,
			CPU:              fmt.Sprintf("%dm", int64(instanceType.CPU*1000)),
			GPU:              fmt.Sprintf("%d", int64(instanceType.GPU)),
			Memory:           fmt.Sprintf("%d%s", instanceType.Memory, getResourceScaleString(instanceType.MemoryScale)),
			EphemeralStorage: fmt.Sprintf("%d%s", labInstance.EphemeralStorage, getResourceScaleString(labInstance.StorageScale)),
			IngressPath:      labInstance.GetIngressPath(),
			InstanceTags:     *instanceTagsHandler.GetTags(),
			InstanceTypeTags: *instanceTypeTagsHandler.GetTags(),
		}
		deploymentTemplate = kubeDeploymentTemplate.DeploymentTemplate
		serviceTemplate = kubeDeploymentTemplate.ServiceTemplate
		ingressTemplate = kubeDeploymentTemplate.IngressTemplate

	case *models.FunctionSetting:
		functionInstance := instance.(*models.FunctionInstance)
		functionSetting := setting.(*models.FunctionSetting)
		kubeDeploymentTemplate := models.NewTemplateHandlerManager(functionSetting).GetKubeDeploymentTemplate()
		u, err := url.Parse(functionSetting.LoadBalancer)
		functionHandler := new(models.FunctionHandlerManager).NewFunctionHandlerManager(*functionInstance)
		functionContext := functionHandler.GetFunctionContext()
		functionTagsHandler := models.NewTagsHandlerManager(functionInstance)
		instanceTypeTagsHandler := models.NewTagsHandlerManager(instanceType)
		var loadBalancer string
		if err == nil {
			loadBalancer = u.Hostname()
		}
		templateVariable = TemplateVariables{
			UUID:             functionInstance.UUID,
			Username:         user.Username,
			UserGroup:        user.Group,
			UserToken:        new(auth.TokenManager).BuildUserToken(user, app.GetConfig().TokenKey),
			Namespace:        functionInstance.Namespace,
			LoadBalancer:     loadBalancer,
			InstanceName:     functionInstance.Name,
			InstanceNumber:   functionInstance.InstanceNumber,
			InstanceType:     functionInstance.InstanceTypeName,
			CPU:              fmt.Sprintf("%dm", int64(instanceType.CPU*1000)),
			GPU:              fmt.Sprintf("%d", int64(instanceType.GPU)),
			Memory:           fmt.Sprintf("%d%s", instanceType.Memory, getResourceScaleString(instanceType.MemoryScale)),
			EphemeralStorage: "10Gi",
			IngressPath:      functionInstance.GetIngressPath(),
			FunctionContext:  new(models.TriggerManager).NewTriggerManager(functionInstance).BuildEncodedJSONContext(*functionContext),
			InstanceTags:     *functionTagsHandler.GetTags(),
			InstanceTypeTags: *instanceTypeTagsHandler.GetTags(),
		}
		deploymentTemplate = kubeDeploymentTemplate.DeploymentTemplate
		serviceTemplate = kubeDeploymentTemplate.ServiceTemplate
		ingressTemplate = kubeDeploymentTemplate.IngressTemplate

	default:
		return nil
	}

	deploymentTemplate = templateParser.Parse(deploymentTemplate, templateVariable)
	decoder := yaml.NewYAMLOrJSONDecoder(bytes.NewReader([]byte(deploymentTemplate)), 100)
	var deploymentRequest appsv1.Deployment
	decoder.Decode(&deploymentRequest)
	var serviceRequest api.Service
	serviceTemplate = templateParser.Parse(serviceTemplate, templateVariable)
	decoder = yaml.NewYAMLOrJSONDecoder(bytes.NewReader([]byte(serviceTemplate)), 100)
	decoder.Decode(&serviceRequest)
	var ingressRequest beta1.Ingress
	ingressTemplate = templateParser.Parse(ingressTemplate, templateVariable)
	decoder = yaml.NewYAMLOrJSONDecoder(bytes.NewReader([]byte(ingressTemplate)), 100)
	decoder.Decode(&ingressRequest)
	return &InstanceSpec{
		Deployment: deploymentRequest,
		Service:    serviceRequest,
		Ingress:    ingressRequest,
	}
}

func DeployInstance(instance interface{}, setting interface{}, instanceType *models.InstanceType, user models.User) (err error) {
	instanceSpec := LoadInstanceSpec(instance, setting, instanceType, user)
	if instanceSpec == nil {
		return errors.New("Unsupported setting type")
	}
	err = CreateDeployment(instanceSpec)
	if err != nil {
		logs.Error(fmt.Sprintf("Create k8s deployment failed: %s", err.Error()))
		return
	}
	err = CreateService(instanceSpec)
	if err != nil {
		logs.Error(fmt.Sprintf("Create k8s service failed: %s", err.Error()))
		return
	}
	err = CreateIngress(instanceSpec)
	if err != nil {
		logs.Error(fmt.Sprintf("Create k8s ingress failed: %s", err.Error()))
	}
	return
}

// CreateDeployment will create a deployment instance on kubernetes
func CreateDeployment(instanceSpec *InstanceSpec) (err error) {
	deploymentsClient := NewAPppsV1().Deployments(instanceSpec.Deployment.Namespace)
	result, err := deploymentsClient.Create(&instanceSpec.Deployment)
	if err == nil {
		logs.Info("Created deployment: Name=[%s], Namespace=[%s]",
			result.GetObjectMeta().GetName(),
			instanceSpec.Deployment.Namespace)
	}
	return
}

func UpdateDeployment(deployment *appsv1.Deployment) (err error) {
	deploymentsClient := NewAPppsV1().Deployments(deployment.Namespace)
	result, err := deploymentsClient.Update(deployment)
	if err == nil {
		logs.Info("Updated deployment: Name=[%s], Namespace=[%s]",
			result.GetObjectMeta().GetName(),
			deployment.Namespace)
	}
	return
}

// CreateService will create a service instance on kubernetes
func CreateService(instanceSpec *InstanceSpec) (err error) {
	serviceClient := NewCoreV1().Services(instanceSpec.Service.Namespace)
	result, err := serviceClient.Create(&instanceSpec.Service)
	if err == nil {
		logs.Info("Created service: Name=[%s], Namespace=[%s]",
			result.GetObjectMeta().GetName(),
			instanceSpec.Service.Namespace)
	}
	return
}

// CreateIngress will create a ingress instance on kubernetes
func CreateIngress(instanceSpec *InstanceSpec) (err error) {
	ingressClient := NewExtensionsV1beta1().Ingresses(instanceSpec.Ingress.Namespace)
	result, err := ingressClient.Create(&instanceSpec.Ingress)
	if err == nil {
		logs.Info("Created ingress: Name=[%s], Namespace=[%s]",
			result.GetObjectMeta().GetName(),
			instanceSpec.Ingress.Namespace)
	}
	return
}

// CreateJob will create a job on kubernetes
func CreateJob(instanceSpec *InstanceSpec) (err error) {
	jobClient := NewBatchV1().Jobs(instanceSpec.Job.Namespace)
	result, err := jobClient.Create(&instanceSpec.Job)
	if err == nil {
		logs.Info("Created job: Name=[%s], Namespace=[%s]",
			result.GetObjectMeta().GetName(),
			instanceSpec.Job.Namespace)
	}
	return
}

func DeleteJobAndPod(job *models.JobInstance) (err error) {
	if job != nil && FetchJob(job.Namespace, job.JobID).Name == "" {
		logs.Warn("Cannot find job [%s], namespace=[%s]", job.JobID, job.Namespace)
		return nil
	}
	err = DeleteJob(job)
	if err != nil {
		return err
	}
	jobManager := GetJobManager()
	podList := FetchPods(job.Namespace)
	matcher := NewPodMatcher(job.JobID)
	pods, err := jobManager.GetJobPodList(job, podList)
	if err != nil {
		return err
	}
	for _, pod := range pods {
		if matcher.MatchJobID(*pod) {
			DeletePod(*pod)
		}
	}
	return
}

func DeleteJob(job *models.JobInstance) (err error) {
	jobClient := NewBatchV1().Jobs(job.Namespace)
	err = jobClient.Delete(job.JobID, &metav1.DeleteOptions{})
	return
}

func DeletePod(pod api.Pod) (err error) {
	podClient := NewCoreV1().Pods(pod.Namespace)
	err = podClient.Delete(pod.Name, &metav1.DeleteOptions{})
	return
}

func DeleteInstance(instance interface{}) (err error) {

	err = DeleteDeployment(instance)
	if err != nil {
		logs.Error(fmt.Sprintf("Delete k8s deployment failed: %s", err.Error()))
		return
	}
	err = DeleteService(instance)
	if err != nil {
		logs.Error(fmt.Sprintf("Delete k8s deployment failed: %s", err.Error()))
		return
	}
	err = DeleteIngress(instance)
	if err != nil {
		logs.Error(fmt.Sprintf("Delete k8s deployment failed: %s", err.Error()))
		return
	}
	return
}

// DeleteDeployment delete deployment instance on kubernetes
func DeleteDeployment(instance interface{}) (err error) {
	UUID := fmt.Sprintf("%s", reflect.Indirect(reflect.ValueOf(instance)).FieldByName("UUID"))
	Namespace := fmt.Sprintf("%s", reflect.Indirect(reflect.ValueOf(instance)).FieldByName("Namespace"))
	deploymentsClient := NewAPppsV1().Deployments(Namespace)
	deletePolicy := metav1.DeletePropagationForeground
	if err := deploymentsClient.Delete(UUID, &metav1.DeleteOptions{
		PropagationPolicy: &deletePolicy,
	}); err == nil {
		logs.Info("Delete deployment: Name=[%s], Namespace=[%s]", UUID, Namespace)
	}
	return
}

// DeleteService delete service instance on kubernetes
func DeleteService(instance interface{}) (err error) {
	UUID := fmt.Sprintf("%s", reflect.Indirect(reflect.ValueOf(instance)).FieldByName("UUID"))
	Namespace := fmt.Sprintf("%s", reflect.Indirect(reflect.ValueOf(instance)).FieldByName("Namespace"))
	serviceClient := NewCoreV1().Services(Namespace)
	deletePolicy := metav1.DeletePropagationForeground
	if err := serviceClient.Delete(UUID, &metav1.DeleteOptions{
		PropagationPolicy: &deletePolicy,
	}); err == nil {
		logs.Info("Delete service: Name=[%s], Namespace=[%s]", UUID, Namespace)
	}
	return
}

func DeleteIngress(instance interface{}) (err error) {
	UUID := fmt.Sprintf("%s", reflect.Indirect(reflect.ValueOf(instance)).FieldByName("UUID"))
	Namespace := fmt.Sprintf("%s", reflect.Indirect(reflect.ValueOf(instance)).FieldByName("Namespace"))
	ingressClient := NewExtensionsV1beta1().Ingresses(Namespace)
	deletePolicy := metav1.DeletePropagationForeground
	if err := ingressClient.Delete(UUID, &metav1.DeleteOptions{
		PropagationPolicy: &deletePolicy,
	}); err == nil {
		logs.Info("Delete service: Name=[%s], Namespace=[%s]", UUID, Namespace)
	}
	return
}

func UpdateFunctionInstance(instance *models.FunctionInstance, oldContext, newContext *models.FunctionContext) (err error) {
	deployment := FetchDeployment(instance.Namespace, instance.UUID)
	instanceNumber := int32(instance.InstanceNumber)
	deployment.Spec.Replicas = &instanceNumber

	history := int32(0)
	deployment.Spec.RevisionHistoryLimit = &history //Remove old Replica Sets

	jsonBytes, err := json.Marshal(deployment)

	if err != nil {
		return err
	}

	triggerManager := new(models.TriggerManager).NewTriggerManager(instance)

	deploymentString := string(jsonBytes)
	deploymentString = strings.Replace(
		deploymentString,
		triggerManager.BuildEncodedJSONContext(*oldContext),
		triggerManager.BuildEncodedJSONContext(*newContext),
		-1,
	)
	var newDeployment appsv1.Deployment
	json.Unmarshal([]byte(deploymentString), &newDeployment)
	err = UpdateDeployment(&newDeployment)
	return err
}

// RestartInstance, restart instance by restarted tag
func RestartFunctionInstance(namespace, UUID string) (err error) {
	deployment := FetchDeployment(namespace, UUID)
	deployment.Spec.Template.Labels["restarted"] = fmt.Sprintf("%d", time.Now().Unix())
	history := int32(0)
	deployment.Spec.RevisionHistoryLimit = &history //Remove old Replica Sets
	err = UpdateDeployment(deployment)
	return err
}
