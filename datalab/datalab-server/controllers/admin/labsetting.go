package admin

import (
	"encoding/json"
	"fmt"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/utils"

	"github.com/astaxie/beego"
	"github.com/astaxie/beego/logs"
)

type LabSettingController struct {
	beego.Controller
}

type LabSettingJSON struct {
	*models.LabSetting
	*models.KubeDeploymentTemplate
	*models.PermissionRoles
}

// NewLabSettingJSON make sure all fields will be initiated
func NewLabSettingJSON() LabSettingJSON {
	return LabSettingJSON{
		LabSetting:             &models.LabSetting{},
		KubeDeploymentTemplate: &models.KubeDeploymentTemplate{},
		PermissionRoles:        &models.PermissionRoles{},
	}
}

func (c *LabSettingController) Get() {
	labSettingManager := models.NewModelManager(models.LabSetting{})
	permissionManager := models.NewModelManager(models.Permission{})
	var labSettings []*models.LabSetting
	labSettingManager.All(&labSettings)
	var existPermission []*models.Permission
	permissionManager.All(&existPermission)

	labSettingResponses := make([]*LabSettingJSON, len(labSettings))
	for i, labSetting := range labSettings {
		templateHandler := models.NewTemplateHandlerManager(labSetting)
		permissionHandler := models.NewPermissionHandlerManager(labSetting)
		labSettingResponses[i] = &LabSettingJSON{
			LabSetting:             labSetting,
			KubeDeploymentTemplate: templateHandler.GetKubeDeploymentTemplate(),
			PermissionRoles:        permissionHandler.GetPermissionRoles(existPermission),
		}
	}
	c.Data["json"] = labSettingResponses
	c.ServeJSON()
}

func (c *LabSettingController) Post() {
	var labSettingJSON = NewLabSettingJSON()
	json.Unmarshal(c.Ctx.Input.RequestBody, &labSettingJSON)
	labSetting := labSettingJSON.LabSetting
	labSetting.TemplatePath = app.GetConfig().DataPath
	err := models.Valid(labSetting)
	if err != nil {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
	} else {
		manager := models.NewModelManager(models.LabSetting{})
		templateHandler := models.NewTemplateHandlerManager(labSetting)
		permissionHandler := models.NewPermissionHandlerManager(labSetting)
		templateErr := templateHandler.SaveKubeDeploymentTemplate(labSettingJSON.KubeDeploymentTemplate)
		permissionErr := permissionHandler.SavePermissionRoles(labSettingJSON.PermissionRoles)

		if templateErr == nil && permissionErr == nil {
			if err := manager.Create(labSetting); err == nil {
				c.Data["json"] = utils.HTTPSuccessJSON()
			} else {
				logs.Error(err.Error())
				templateHandler.DeleteTemplate()
				permissionHandler.DeletePermissionRoles()
				c.CustomAbort(400, utils.HTTPFailedJSONString("Insert error, maybe duplicated"))
			}
		} else {
			if templateErr != nil {
				logs.Error(templateErr.Error())
			}
			if permissionErr != nil {
				logs.Error(permissionErr.Error())
			}
			templateHandler.DeleteTemplate()
			permissionHandler.DeletePermissionRoles()
			c.CustomAbort(400, utils.HTTPFailedJSONString("Insert error, system failed"))
		}
	}
	c.ServeJSON()
}

func (c *LabSettingController) Delete() {
	var labSettingJSON = NewLabSettingJSON()
	json.Unmarshal(c.Ctx.Input.RequestBody, &labSettingJSON)
	var targetLabSetting models.LabSetting
	manager := models.NewModelManager(models.LabSetting{})
	manager.FindInstanceByID(labSettingJSON.ID, &targetLabSetting)
	if targetLabSetting.ID > 0 {
		err := manager.Delete(&targetLabSetting)
		if err == nil {
			templateHandler := models.NewTemplateHandlerManager(&targetLabSetting)
			permissionHandler := models.NewPermissionHandlerManager(&targetLabSetting)
			templateHandler.DeleteTemplate()
			permissionHandler.DeletePermissionRoles()
			c.Data["json"] = utils.HTTPSuccessJSON()
		} else {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
		}
	} else {
		message := fmt.Sprintf("Cannot find %d", labSettingJSON.ID)
		logs.Error(message)
		c.CustomAbort(400, utils.HTTPFailedJSONString(message))
	}
	c.ServeJSON()
}

func (c *LabSettingController) Put() {
	var targetLabSettingJSON = NewLabSettingJSON()
	json.Unmarshal(c.Ctx.Input.RequestBody, &targetLabSettingJSON)
	targetLabSetting := targetLabSettingJSON.LabSetting
	targetLabSetting.TemplatePath = app.GetConfig().DataPath
	manager := models.NewModelManager(models.LabSetting{})

	var originLabSetting models.LabSetting
	err := manager.FindInstanceByID(targetLabSetting.ID, &originLabSetting)

	if err == nil {
		err = models.Valid(targetLabSetting)
		if err != nil {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
		} else {
			//Id and name cannot be edited
			targetLabSetting.ID = originLabSetting.ID
			targetLabSetting.Name = originLabSetting.Name

			permissionManager := models.NewModelManager(models.Permission{})
			var existPermission []*models.Permission
			permissionManager.All(&existPermission)

			var kubeDeploymentTemplate models.KubeDeploymentTemplate
			var permissionRoles models.PermissionRoles
			json.Unmarshal(c.Ctx.Input.RequestBody, &kubeDeploymentTemplate)
			json.Unmarshal(c.Ctx.Input.RequestBody, &permissionRoles)

			originTemplateHandler := models.NewTemplateHandlerManager(&originLabSetting)
			originPermissionHandler := models.NewPermissionHandlerManager(&originLabSetting)
			originTemplate := originTemplateHandler.GetKubeDeploymentTemplate()
			originPermissionRoles := originPermissionHandler.GetPermissionRoles(existPermission)

			targetTemplateHandler := models.NewTemplateHandlerManager(targetLabSetting)
			targetPermissionHandler := models.NewPermissionHandlerManager(targetLabSetting)

			originTemplateHandler.DeleteTemplate()
			originPermissionHandler.DeletePermissionRoles()

			templateErr := targetTemplateHandler.SaveKubeDeploymentTemplate(&kubeDeploymentTemplate)
			permissionErr := targetPermissionHandler.SavePermissionRoles(&permissionRoles)

			if templateErr == nil && permissionErr == nil {
				err = manager.Update(targetLabSetting)
				if err == nil {
					c.Data["json"] = utils.HTTPSuccessJSON()
				} else {
					logs.Error(err.Error())
					originTemplateHandler.SaveKubeDeploymentTemplate(originTemplate)
					originPermissionHandler.SavePermissionRoles(originPermissionRoles)
					c.CustomAbort(400, utils.HTTPFailedJSONString("Insert error, maybe duplicated"))
				}
			} else {
				if templateErr != nil {
					logs.Error(templateErr.Error())
				}
				if permissionErr != nil {
					logs.Error(permissionErr.Error())
				}
				originTemplateHandler.SaveKubeDeploymentTemplate(originTemplate)
				originPermissionHandler.SavePermissionRoles(originPermissionRoles)
				c.CustomAbort(400, utils.HTTPFailedJSONString("Update error, system failed"))
			}
		}
	} else {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString(fmt.Sprintf("Cannot found labsetting %d", targetLabSetting.ID)))
	}
	c.ServeJSON()
}
