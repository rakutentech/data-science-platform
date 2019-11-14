package app

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/auth"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/kubernetes"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/utils"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/logs"
)

type FunctionController struct {
	beego.Controller
}

type FunctionSettingJSON struct {
	ID                 int
	Name               string
	Description        string
	ProgramLanguage    string
	Trigger            string
	LoadBalancer       string
	DefaultFunction    string
	DefaultRequirement string
}

func (c *FunctionController) GetFunctionSettings() {
	functionSettingsJSON := []FunctionSettingJSON{}
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	functionSettings := GetAccessibleFunctionSettings(user)

	for _, functionSetting := range functionSettings {
		templateHandler := models.NewTemplateHandlerManager(functionSetting)
		functionSettingJSON := FunctionSettingJSON{
			ID:                 functionSetting.ID,
			Name:               functionSetting.Name,
			Description:        functionSetting.Description,
			ProgramLanguage:    functionSetting.ProgramLanguage,
			Trigger:            functionSetting.Trigger,
			LoadBalancer:       functionSetting.LoadBalancer,
			DefaultFunction:    templateHandler.GetDefaultContextTemplate().DefaultFunction,
			DefaultRequirement: templateHandler.GetDefaultContextTemplate().DefaultRequirement,
		}
		functionSettingsJSON = append(functionSettingsJSON, functionSettingJSON)
	}
	c.Data["json"] = functionSettingsJSON
	c.ServeJSON()
}

func GetAccessibleFunctionSettings(user models.User) []*models.FunctionSetting {
	functionManager := models.NewModelManager(models.FunctionSetting{})
	permissionManager := models.NewModelManager(models.Permission{})
	var functionSettings []*models.FunctionSetting
	functionManager.All(&functionSettings)
	var existPermission []*models.Permission
	permissionManager.All(&existPermission)

	result := []*models.FunctionSetting{}
	for _, functionSetting := range functionSettings {
		permissionHandler := models.NewPermissionHandlerManager(functionSetting)
		if functionSetting.GetPublic() || permissionHandler.CheckPermissionRoles(existPermission, user) {
			result = append(result, functionSetting)
		}
	}
	return result
}

type FunctionInstanceJSON struct {
	*models.FunctionInstanceData
	FunctionContext *models.FunctionContext
	*models.Tags
	*kubernetes.PodStatus
}

func (c *FunctionController) Get() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)

	instanceManager := models.NewModelManager(models.FunctionInstance{})
	var instances []*models.FunctionInstance
	instanceManager.FindInstances(map[string]interface{}{
		"owner": user.Username,
	}, &instances)
	instancesJSON := make([]*FunctionInstanceJSON, len(instances))
	podList := kubernetes.FetchPods(user.Namespace)
	serviceList := kubernetes.FetchServices(user.Namespace)
	ingressList := kubernetes.FetchIngress(user.Namespace)
	jobManager := models.NewModelManager(models.JobInstance{})
	var jobInstances []*models.JobInstance
	jobManager.FindInstances(map[string]interface{}{
		"owner": user.Username,
	}, &jobInstances)
	for i, instance := range instances {
		functionHandler := new(models.FunctionHandlerManager).NewFunctionHandlerManager(*instance)
		tagsHandler := models.NewTagsHandlerManager(instance)
		statusRequest := kubernetes.InstanceStatusRequest{
			PodStatusHandler: instance,
			JobInstances:     jobInstances,
			PodList:          podList,
			ServiceList:      serviceList,
			IngressList:      ingressList,
		}
		instancesJSON[i] = &FunctionInstanceJSON{
			FunctionInstanceData: &instance.FunctionInstanceData,
			FunctionContext:      functionHandler.GetFunctionContext(),
			PodStatus:            kubernetes.GetPodStatus(&statusRequest),
			Tags:                 tagsHandler.GetTags(),
		}
	}
	c.Data["json"] = instancesJSON
	c.ServeJSON()
}

type CreateFunctionRequest struct {
	models.FunctionInstanceData
	FunctionContext models.FunctionContext
	models.Tags
}

func (c *FunctionController) Post() {
	var request CreateFunctionRequest
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	json.Unmarshal(c.Ctx.Input.RequestBody, &request)
	instance := &models.FunctionInstance{
		FunctionInstanceData: models.FunctionInstanceData{
			Name:                request.Name,
			FunctionName:        request.FunctionName,
			UUID:                models.GenerateUUID(models.FunctionInstance{}, request.Name, user.Username),
			Trigger:             request.Trigger,
			InstanceTypeName:    request.InstanceTypeName,
			InstanceNumber:      request.InstanceNumber,
			IngressPath:         request.IngressPath,
			Owner:               user.Username,
			CreateAt:            time.Now().Unix(),
			Namespace:           user.Namespace,
			FunctionContextType: request.FunctionContextType,
		},
		TagsJSON: string(new(models.TagsHandlerManager).ConvertTagsToJSON(request.Tags)),
	}
	functionHandler := new(models.FunctionHandlerManager).NewFunctionHandlerManager(*instance)
	err := functionHandler.ApplyFunctionContext(request.FunctionContext)
	if err == nil {
		instance.FunctionRef = functionHandler.GetFunctionRef()
		logs.Info("User [%s] create instance trigger=[%s], name=[%s]", user.Username, instance.Trigger, instance.Name)

		err = instance.Valid()
		if err == nil {
			var setting *models.FunctionSetting
			var instanceType *models.InstanceType
			settings := GetAccessibleFunctionSettings(user)
			instanceTypes := GetAccessibleInstanceTypes(user)
			for _, accessibleSetting := range settings {
				if accessibleSetting.Name == request.FunctionName {
					setting = accessibleSetting
				}
			}
			for _, accessibleInstanceType := range instanceTypes {
				if accessibleInstanceType.Name == request.InstanceTypeName {
					instanceType = accessibleInstanceType
				}
			}
			if instanceType != nil && setting != nil {
				instance.LoadBalancer = setting.LoadBalancer
				instanceManager := models.NewModelManager(models.FunctionInstance{})
				err = instanceManager.Create(instance)
				if err == nil {
					if !instance.IsEventTrigger() {
						err = kubernetes.DeployInstance(instance, setting, instanceType, user)
					}
					if err == nil {
						c.Data["json"] = utils.HTTPSuccessJSON()
					} else {
						var removedInstance models.FunctionInstance
						instanceManager.FindOne(map[string]interface{}{
							"name":    instance.Name,
							"Trigger": instance.Trigger,
							"owner":   user.Username,
						}, &removedInstance)
						if removedInstance.ID > 0 {
							instanceManager.Delete(&removedInstance)
						}
						logs.Error("Remove failed instance: %d, reason=[%s]", removedInstance.ID, err.Error())
						c.CustomAbort(400, utils.HTTPFailedJSONString("Deploy instance failed"))
					}
				} else {
					logs.Error(err.Error())
					c.CustomAbort(400, utils.HTTPFailedJSONString("Create instance failed"))
				}
			} else {
				logs.Error(fmt.Sprintf("Access denied: Create [%s] instance, setting=[%v], intanceType=[%v]",
					request.Name,
					setting != nil,
					instanceType != nil))
				c.CustomAbort(403, utils.HTTPFailedJSONString("Access denied"))
			}
		} else {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString("Invalid input"))
		}
	} else {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString("Invalid context"))
	}
	c.ServeJSON()
}

type UpdateFunctionRequest struct {
	ID              int
	InstanceNumber  int
	FunctionContext models.FunctionContext
	models.Tags
}

func (c *FunctionController) Put() {
	var request UpdateFunctionRequest
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	manager := models.NewModelManager(models.FunctionInstance{})
	var targetInstance models.FunctionInstance
	json.Unmarshal(c.Ctx.Input.RequestBody, &request)
	manager.FindOne(map[string]interface{}{
		"id":    request.ID,
		"owner": user.Username,
	}, &targetInstance)
	if targetInstance.ID > 0 {
		logs.Info("User [%s] update instance function=[%s], name=[%s]",
			user.Username, targetInstance.FunctionName, targetInstance.Name)

		targetInstance.InstanceNumber = request.InstanceNumber
		functionHandler := new(models.FunctionHandlerManager).NewFunctionHandlerManager(targetInstance)
		oldContext := functionHandler.GetFunctionContext()
		functionHandler.ApplyFunctionContext(request.FunctionContext)
		err := manager.Update(&targetInstance)
		if err == nil {
			if !targetInstance.IsEventTrigger() {
				err = kubernetes.UpdateFunctionInstance(&targetInstance, oldContext, &request.FunctionContext)
			}
			if err != nil {
				logs.Error(err.Error())
				c.CustomAbort(400, utils.HTTPFailedJSONString("Update instance failed"))
			} else {
				c.Data["json"] = utils.HTTPSuccessJSON()
			}
		} else {
			c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
		}
	} else {
		errMsg := fmt.Sprintf("Update error. Unknown ID: [%d], User: [%s]", targetInstance.ID, user.Username)
		logs.Error(errMsg)
		c.CustomAbort(400, utils.HTTPFailedJSONString(errMsg))
	}
	c.ServeJSON()
}

func (c *FunctionController) Delete() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	var request models.FunctionInstance
	json.Unmarshal(c.Ctx.Input.RequestBody, &request)
	manager := models.NewModelManager(models.FunctionInstance{})
	var targetInstance models.FunctionInstance
	manager.FindOne(map[string]interface{}{
		"id":    request.ID,
		"owner": user.Username,
	}, &targetInstance)

	if targetInstance.ID > 0 {
		logs.Info("User [%s] delete instance function=[%s], name=[%s]",
			user.Username, targetInstance.FunctionName, targetInstance.Name)
		// Delete db record
		err := manager.Delete(&targetInstance)
		if err == nil {
			//Delete kube instance
			if targetInstance.IsEventTrigger() {
				kubernetes.GetJobManager().UnregisterJob(targetInstance)
			} else {
				err = kubernetes.DeleteInstance(&targetInstance)
			}
			if err != nil {
				logs.Error(err.Error())
			}
			c.Data["json"] = utils.HTTPSuccessJSON()
		} else {
			c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
		}
	} else {
		errMsg := fmt.Sprintf("Delete error. Unknown ID: [%d], User: [%s]", targetInstance.ID, user.Username)
		logs.Error(errMsg)
		c.CustomAbort(400, utils.HTTPFailedJSONString(errMsg))
	}
	c.ServeJSON()
}

func (c *FunctionController) GetFunctionDetail() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	trigger := c.Ctx.Input.Param(":trigger")
	instanceName := c.Ctx.Input.Param(":instancename")
	manager := models.NewModelManager(models.FunctionInstance{})
	var targetInstance models.FunctionInstance

	err := manager.FindOne(map[string]interface{}{
		"name":    instanceName,
		"trigger": trigger,
		"owner":   user.Username,
	}, &targetInstance)
	if err == nil {
		podList := kubernetes.FetchPods(user.Namespace)
		serviceList := kubernetes.FetchServices(user.Namespace)
		ingressList := kubernetes.FetchIngress(user.Namespace)
		jobManager := models.NewModelManager(models.JobInstance{})
		var jobInstances []*models.JobInstance
		if targetInstance.IsEventTrigger() {
			jobManager.FindInstances(map[string]interface{}{
				"owner":        user.Username,
				"InstanceName": instanceName,
			}, &jobInstances)
		}
		functionHandler := new(models.FunctionHandlerManager).NewFunctionHandlerManager(targetInstance)
		tagsHandler := models.NewTagsHandlerManager(&targetInstance)
		statusRequest := kubernetes.InstanceStatusRequest{
			PodStatusHandler: &targetInstance,
			JobInstances:     jobInstances,
			PodList:          podList,
			ServiceList:      serviceList,
			IngressList:      ingressList,
		}
		instancesJSON := &FunctionInstanceJSON{
			FunctionInstanceData: &targetInstance.FunctionInstanceData,
			FunctionContext:      functionHandler.GetFunctionContext(),
			PodStatus:            kubernetes.GetPodStatus(&statusRequest),
			Tags:                 tagsHandler.GetTags(),
		}
		c.Data["json"] = instancesJSON
		c.ServeJSON()
	} else {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString("Cannot get instance"))
	}
}

func (c *FunctionController) GetFunctionLog() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	trigger := c.Ctx.Input.Param(":trigger")
	instanceName := c.Ctx.Input.Param(":instancename")
	manager := models.NewModelManager(models.FunctionInstance{})
	var targetInstance models.FunctionInstance
	err := manager.FindOne(map[string]interface{}{
		"name":    instanceName,
		"trigger": trigger,
		"owner":   user.Username,
	}, &targetInstance)
	if err == nil {
		c.Data["json"] = kubernetes.GetDeploymentLog(targetInstance.Namespace, targetInstance.UUID, 1000)
		c.ServeJSON()
	} else {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString("Cannot get instance"))
	}
}

func (c *FunctionController) RestartFunction() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	trigger := c.Ctx.Input.Param(":trigger")
	instanceName := c.Ctx.Input.Param(":instancename")
	manager := models.NewModelManager(models.FunctionInstance{})
	var targetInstance models.FunctionInstance
	manager.FindOne(map[string]interface{}{
		"name":    instanceName,
		"trigger": trigger,
		"owner":   user.Username,
	}, &targetInstance)

	if targetInstance.ID > 0 && targetInstance.Trigger == models.HTTPTrigger {
		logs.Info("User [%s] Restart instance function=[%s], name=[%s]",
			user.Username, targetInstance.FunctionName, targetInstance.Name)
		err := kubernetes.RestartFunctionInstance(targetInstance.Namespace, targetInstance.UUID)
		if err != nil {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString("Restart instance failed"))
		} else {
			c.Data["json"] = utils.HTTPSuccessJSON()
		}
	} else {
		errMsg := fmt.Sprintf("Delete error. ID: [%d], Trigger:[%s], User: [%s]",
			targetInstance.ID,
			targetInstance.Trigger,
			user.Username)
		logs.Error(errMsg)
		c.CustomAbort(400, utils.HTTPFailedJSONString(errMsg))
	}
	c.ServeJSON()
}
