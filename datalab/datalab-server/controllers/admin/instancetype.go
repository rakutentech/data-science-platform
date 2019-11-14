package admin

import (
	"encoding/json"
	"fmt"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/utils"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/logs"
)

type InstanceTypeController struct {
	beego.Controller
}

type InstanceTypeJSON struct {
	*models.InstanceTypeSetting
	*models.PermissionRoles
	*models.Tags
}

// NewInstanceTypeJSON make sure all fields will be initiated
func NewInstanceTypeJSON() InstanceTypeJSON {
	return InstanceTypeJSON{
		InstanceTypeSetting: &models.InstanceTypeSetting{},
		PermissionRoles:     &models.PermissionRoles{},
		Tags:                &models.Tags{},
	}
}

func (c *InstanceTypeController) Get() {
	instanceTypeManager := models.NewModelManager(models.InstanceType{})
	permissionManager := models.NewModelManager(models.Permission{})
	var instanceTypes []*models.InstanceType
	instanceTypeManager.All(&instanceTypes)
	var existPermission []*models.Permission
	permissionManager.All(&existPermission)

	labSettingResponses := make([]*InstanceTypeJSON, len(instanceTypes))
	for i, instanceType := range instanceTypes {
		permissionHandler := models.NewPermissionHandlerManager(instanceType)
		tagsHandler := models.NewTagsHandlerManager(instanceType)
		labSettingResponses[i] = &InstanceTypeJSON{
			InstanceTypeSetting: &instanceType.InstanceTypeSetting,
			PermissionRoles:     permissionHandler.GetPermissionRoles(existPermission),
			Tags:                tagsHandler.GetTags(),
		}
	}
	c.Data["json"] = labSettingResponses
	c.ServeJSON()
}

func (c *InstanceTypeController) Post() {
	var instanceTypeJSON = NewInstanceTypeJSON()
	json.Unmarshal(c.Ctx.Input.RequestBody, &instanceTypeJSON)
	err := models.Valid(*instanceTypeJSON.InstanceTypeSetting)
	if err != nil {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
	} else {
		manager := models.NewModelManager(models.InstanceType{})
		instanceType := models.InstanceType{
			InstanceTypeSetting: *instanceTypeJSON.InstanceTypeSetting,
			TagsJSON:            string(models.NewTagsHandlerManager(nil).ConvertTagsToJSON(*instanceTypeJSON.Tags)),
		}
		permissionHandler := models.NewPermissionHandlerManager(&instanceType)
		permissionErr := permissionHandler.SavePermissionRoles(instanceTypeJSON.PermissionRoles)

		if permissionErr == nil {
			if err := manager.Create(&instanceType); err == nil {
				c.Data["json"] = utils.HTTPSuccessJSON()
			} else {
				logs.Error(err.Error())
				permissionHandler.DeletePermissionRoles()
				c.CustomAbort(400, utils.HTTPFailedJSONString("Insert error, maybe duplicated"))
			}
		} else {
			if permissionErr != nil {
				logs.Error(permissionErr.Error())
			}
			permissionHandler.DeletePermissionRoles()
			c.CustomAbort(400, utils.HTTPFailedJSONString("Insert error, system failed"))
		}
	}
	c.ServeJSON()
}

func (c *InstanceTypeController) Delete() {
	var instanceTypeJSON = NewInstanceTypeJSON()
	json.Unmarshal(c.Ctx.Input.RequestBody, &instanceTypeJSON)
	var targetInstanceType models.InstanceType
	manager := models.NewModelManager(models.InstanceType{})
	manager.FindInstanceByID(instanceTypeJSON.ID, &targetInstanceType)
	if targetInstanceType.ID > 0 {
		err := manager.Delete(&targetInstanceType)
		if err == nil {
			permissionHandler := models.NewPermissionHandlerManager(&targetInstanceType)
			permissionHandler.DeletePermissionRoles()
			c.Data["json"] = utils.HTTPSuccessJSON()
		} else {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
		}
	} else {
		message := fmt.Sprintf("Cannot find %d", instanceTypeJSON.ID)
		logs.Error(message)
		c.CustomAbort(400, utils.HTTPFailedJSONString(message))
	}
	c.ServeJSON()
}

func (c *InstanceTypeController) Put() {
	var targatInstanceTypeJSON = NewInstanceTypeJSON()
	json.Unmarshal(c.Ctx.Input.RequestBody, &targatInstanceTypeJSON)
	manager := models.NewModelManager(models.InstanceType{})

	var originInstanceType models.InstanceType
	err := manager.FindInstanceByID(targatInstanceTypeJSON.ID, &originInstanceType)

	if err == nil {
		err = models.Valid(*targatInstanceTypeJSON.InstanceTypeSetting)
		if err != nil {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
		} else {
			//Id and name cannot be edited
			targatInstanceTypeJSON.ID = originInstanceType.ID
			targatInstanceTypeJSON.Name = originInstanceType.Name

			permissionManager := models.NewModelManager(models.Permission{})
			var existPermission []*models.Permission
			permissionManager.All(&existPermission)
			targetInstanceType := models.InstanceType{
				InstanceTypeSetting: *targatInstanceTypeJSON.InstanceTypeSetting,
				TagsJSON:            string(models.NewTagsHandlerManager(nil).ConvertTagsToJSON(*targatInstanceTypeJSON.Tags)),
			}

			originPermissionHandler := models.NewPermissionHandlerManager(&originInstanceType)
			originPermissionRoles := originPermissionHandler.GetPermissionRoles(existPermission)
			targetPermissionHandler := models.NewPermissionHandlerManager(&targetInstanceType)

			originPermissionHandler.DeletePermissionRoles()
			permissionErr := targetPermissionHandler.SavePermissionRoles(targatInstanceTypeJSON.PermissionRoles)

			if permissionErr == nil {
				err = manager.Update(&targetInstanceType)
				if err == nil {
					c.Data["json"] = utils.HTTPSuccessJSON()
				} else {
					logs.Error(err.Error())
					originPermissionHandler.SavePermissionRoles(originPermissionRoles)
					c.CustomAbort(400, utils.HTTPFailedJSONString("Insert error, maybe duplicated"))
				}
			} else {
				if permissionErr != nil {
					logs.Error(permissionErr.Error())
				}
				originPermissionHandler.SavePermissionRoles(originPermissionRoles)
				c.CustomAbort(400, utils.HTTPFailedJSONString("Update error, system failed"))
			}
		}
	} else {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString(fmt.Sprintf("Cannot found labsetting %d", targatInstanceTypeJSON.ID)))
	}
	c.ServeJSON()
}
