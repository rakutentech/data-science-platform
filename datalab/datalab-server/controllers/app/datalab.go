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

type DataLabController struct {
	beego.Controller
}

type LabSettingJSON struct {
	ID          int
	Name        string
	Description string
	Group       string
}

func (c *DataLabController) GetDataLabSettings() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	labSettings := GetAccessibleLabSettings(user)
	labSettingsJSON := []LabSettingJSON{}
	for _, labSetting := range labSettings {
		labSettingJSON := LabSettingJSON{
			ID:          labSetting.ID,
			Name:        labSetting.Name,
			Description: labSetting.Description,
			Group:       labSetting.Group,
		}
		labSettingsJSON = append(labSettingsJSON, labSettingJSON)
	}
	c.Data["json"] = labSettingsJSON
	c.ServeJSON()
}
func GetAccessibleLabSettings(user models.User) []*models.LabSetting {
	labManager := models.NewModelManager(models.LabSetting{})
	permissionManager := models.NewModelManager(models.Permission{})
	var labSettings []*models.LabSetting
	labManager.All(&labSettings)
	var existPermission []*models.Permission
	permissionManager.All(&existPermission)
	result := []*models.LabSetting{}
	for _, lab := range labSettings {
		permissionHandler := models.NewPermissionHandlerManager(lab)
		if permissionHandler.GetPublic() || permissionHandler.CheckPermissionRoles(existPermission, user) {
			result = append(result, lab)
		}
	}
	return result
}

//Instance CRUD

type LabInstanceJSON struct {
	*models.LabInstanceData
	*models.Tags
	*kubernetes.PodStatus
}

func (c *DataLabController) Get() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)

	instanceManager := models.NewModelManager(models.LabInstance{})
	var labInstances []*models.LabInstance
	instanceManager.FindInstances(map[string]interface{}{
		"owner": user.Username,
	}, &labInstances)

	labInstancesJSON := make([]*LabInstanceJSON, len(labInstances))
	podList := kubernetes.FetchPods(user.Namespace)
	serviceList := kubernetes.FetchServices(user.Namespace)
	ingressList := kubernetes.FetchIngress(user.Namespace)
	for i, instance := range labInstances {
		tagsHandler := models.NewTagsHandlerManager(instance)
		statusRequest := kubernetes.InstanceStatusRequest{
			PodStatusHandler: instance,
			PodList:          podList,
			ServiceList:      serviceList,
			IngressList:      ingressList,
		}
		labInstancesJSON[i] = &LabInstanceJSON{
			LabInstanceData: &instance.LabInstanceData,
			PodStatus:       kubernetes.GetPodStatus(&statusRequest),
			Tags:            tagsHandler.GetTags(),
		}
	}
	c.Data["json"] = labInstancesJSON
	c.ServeJSON()
}

type CreateLabRequest struct {
	TypeName         string
	TypeGroup        string
	Name             string
	InstanceTypeName string
	EphemeralStorage int
	models.Tags
}

func (c *DataLabController) Post() {
	var request CreateLabRequest
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	json.Unmarshal(c.Ctx.Input.RequestBody, &request)

	labInstance := &models.LabInstance{
		LabInstanceData: models.LabInstanceData{
			Name:             request.Name,
			UUID:             models.GenerateUUID(models.LabInstance{}, request.Name, user.Username),
			TypeName:         request.TypeName,
			TypeGroup:        request.TypeGroup,
			InstanceTypeName: request.InstanceTypeName,
			EphemeralStorage: request.EphemeralStorage,
			InstanceNumber:   1,
			Owner:            user.Username,
			StorageScale:     "GiB",
			CreateAt:         time.Now().Unix(),
			Namespace:        user.Namespace,
		},
		TagsJSON: string(new(models.TagsHandlerManager).ConvertTagsToJSON(request.Tags)),
	}
	logs.Info("User [%s] create instance group=[%s], type=[%s], name=[%s]",
		user.Username,
		labInstance.TypeGroup,
		labInstance.TypeName,
		labInstance.Name)

	err := models.Valid(labInstance)
	if err == nil {
		var labSetting *models.LabSetting
		var instanceType *models.InstanceType
		labSettings := GetAccessibleLabSettings(user)
		instanceTypes := GetAccessibleInstanceTypes(user)
		for _, accessibleLabSetting := range labSettings {
			if accessibleLabSetting.Name == request.TypeName && accessibleLabSetting.Group == request.TypeGroup {
				labSetting = accessibleLabSetting
			}
		}
		for _, accessibleInstanceType := range instanceTypes {
			if accessibleInstanceType.Name == request.InstanceTypeName {
				instanceType = accessibleInstanceType
			}
		}
		if instanceType != nil && labSetting != nil {
			labInstance.LoadBalancer = labSetting.LoadBalancer
			instanceManager := models.NewModelManager(models.LabInstance{})
			err = instanceManager.Create(labInstance)
			if err == nil {
				err = kubernetes.DeployInstance(labInstance, labSetting, instanceType, user)
				if err == nil {
					c.Data["json"] = utils.HTTPSuccessJSON()
				} else {
					var removedInstance models.LabInstance
					instanceManager.FindOne(map[string]interface{}{
						"name":      labInstance.Name,
						"typeGroup": labInstance.TypeGroup,
						"typeName":  labInstance.TypeName,
						"owner":     user.Username,
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
			logs.Error(fmt.Sprintf("Access denied: Create [%s] instance, lab=[%v], intanceType=[%v]",
				request.Name,
				labSetting != nil,
				instanceType != nil))
			c.CustomAbort(403, utils.HTTPFailedJSONString("Access denied"))
		}
	} else {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString("Invalid input"))
	}
	c.ServeJSON()
}

func (c *DataLabController) Delete() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	var request models.LabInstance
	json.Unmarshal(c.Ctx.Input.RequestBody, &request)
	manager := models.NewModelManager(models.LabInstance{})
	var targetInstance models.LabInstance
	manager.FindOne(map[string]interface{}{
		"id":    request.ID,
		"owner": user.Username,
	}, &targetInstance)

	if targetInstance.ID > 0 {
		logs.Info("User [%s] delete instance group=[%s], type=[%s], name=[%s]",
			user.Username,
			targetInstance.TypeGroup,
			targetInstance.TypeName,
			targetInstance.Name)
		// Delete db record
		err := manager.Delete(&targetInstance)
		if err == nil {
			//Delete kube instance
			err = kubernetes.DeleteInstance(&targetInstance)
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

func (c *DataLabController) GetDataLabDetail() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	typeGroup := c.Ctx.Input.Param(":typegroup")
	typeName := c.Ctx.Input.Param(":typename")
	instanceName := c.Ctx.Input.Param(":instancename")
	manager := models.NewModelManager(models.LabInstance{})
	var targetInstance models.LabInstance
	err := manager.FindOne(map[string]interface{}{
		"name":      instanceName,
		"typeGroup": typeGroup,
		"typeName":  typeName,
		"owner":     user.Username,
	}, &targetInstance)
	if err == nil {
		podList := kubernetes.FetchPods(user.Namespace)
		serviceList := kubernetes.FetchServices(user.Namespace)
		ingressList := kubernetes.FetchIngress(user.Namespace)
		tagsHandler := models.NewTagsHandlerManager(&targetInstance)
		statusRequest := kubernetes.InstanceStatusRequest{
			PodStatusHandler: &targetInstance,
			PodList:          podList,
			ServiceList:      serviceList,
			IngressList:      ingressList,
		}
		labInstancesJSON := &LabInstanceJSON{
			LabInstanceData: &targetInstance.LabInstanceData,
			PodStatus:       kubernetes.GetPodStatus(&statusRequest),
			Tags:            tagsHandler.GetTags(),
		}
		c.Data["json"] = labInstancesJSON
		c.ServeJSON()
	} else {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString("Cannot get instance"))
	}
}

func (c *DataLabController) GetDataLabLog() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	typeGroup := c.Ctx.Input.Param(":typegroup")
	typeName := c.Ctx.Input.Param(":typename")
	instanceName := c.Ctx.Input.Param(":instancename")
	manager := models.NewModelManager(models.LabInstance{})
	var targetInstance models.LabInstance
	err := manager.FindOne(map[string]interface{}{
		"name":      instanceName,
		"typeGroup": typeGroup,
		"typeName":  typeName,
		"owner":     user.Username,
	}, &targetInstance)
	if err == nil {
		c.Data["json"] = kubernetes.GetDeploymentLog(targetInstance.Namespace, targetInstance.UUID, 1000)
		c.ServeJSON()
	} else {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString("Cannot get instance"))
	}
}
