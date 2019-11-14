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

type FunctionSettingController struct {
	beego.Controller
}

type FunctionSettingJSON struct {
	*models.FunctionSetting
	*models.DefaultContextTemplate
	*models.KubeDeploymentTemplate
	*models.KubeJobTemplate
	*models.PermissionRoles
}

// NewFunctionSettingJSON make sure all fields will be initiated
func NewFunctionSettingJSON() FunctionSettingJSON {
	return FunctionSettingJSON{
		FunctionSetting:        &models.FunctionSetting{},
		DefaultContextTemplate: &models.DefaultContextTemplate{},
		KubeDeploymentTemplate: &models.KubeDeploymentTemplate{},
		KubeJobTemplate:        &models.KubeJobTemplate{},
		PermissionRoles:        &models.PermissionRoles{},
	}
}

func (c *FunctionSettingController) Get() {
	functionSettingManager := models.NewModelManager(models.FunctionSetting{})
	permissionManager := models.NewModelManager(models.Permission{})
	var functionSettings []*models.FunctionSetting
	functionSettingManager.All(&functionSettings)
	var existPermission []*models.Permission
	permissionManager.All(&existPermission)

	functionSettingResponses := make([]*FunctionSettingJSON, len(functionSettings))
	for i, functionSetting := range functionSettings {
		templateHandler := models.NewTemplateHandlerManager(functionSetting)
		permissionHandler := models.NewPermissionHandlerManager(functionSetting)
		if functionSetting.Trigger == models.HTTPTrigger {
			functionSettingResponses[i] = &FunctionSettingJSON{
				FunctionSetting:        functionSetting,
				DefaultContextTemplate: templateHandler.GetDefaultContextTemplate(),
				KubeDeploymentTemplate: templateHandler.GetKubeDeploymentTemplate(),
				KubeJobTemplate:        &models.KubeJobTemplate{},
				PermissionRoles:        permissionHandler.GetPermissionRoles(existPermission),
			}
		} else if functionSetting.Trigger == models.EventTrigger {
			functionSettingResponses[i] = &FunctionSettingJSON{
				FunctionSetting:        functionSetting,
				DefaultContextTemplate: templateHandler.GetDefaultContextTemplate(),
				KubeDeploymentTemplate: &models.KubeDeploymentTemplate{},
				KubeJobTemplate:        templateHandler.GetKubeJobTemplate(),
				PermissionRoles:        permissionHandler.GetPermissionRoles(existPermission),
			}
		}
	}
	c.Data["json"] = functionSettingResponses
	c.ServeJSON()
}

func (c *FunctionSettingController) Post() {
	var functionSettingJSON = NewFunctionSettingJSON()
	json.Unmarshal(c.Ctx.Input.RequestBody, &functionSettingJSON)
	functionSetting := *functionSettingJSON.FunctionSetting
	functionSetting.TemplatePath = app.GetConfig().DataPath
	err := models.Valid(functionSetting)
	if err != nil {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
	} else {
		manager := models.NewModelManager(models.FunctionSetting{})
		templateHandler := models.NewTemplateHandlerManager(&functionSetting)
		permissionHandler := models.NewPermissionHandlerManager(&functionSetting)

		defaultContextErr := templateHandler.SaveDefaultContextTemplate(functionSettingJSON.DefaultContextTemplate)
		deploymentTemplateErr := templateHandler.SaveKubeDeploymentTemplate(functionSettingJSON.KubeDeploymentTemplate)
		jobTemplateErr := templateHandler.SaveKubeJobTemplate(functionSettingJSON.KubeJobTemplate)
		permissionErr := permissionHandler.SavePermissionRoles(functionSettingJSON.PermissionRoles)

		if deploymentTemplateErr == nil && jobTemplateErr == nil && permissionErr == nil && defaultContextErr == nil {
			if err := manager.Create(&functionSetting); err == nil {
				c.Data["json"] = utils.HTTPSuccessJSON()
			} else {
				logs.Error(err.Error())
				templateHandler.DeleteTemplate()
				permissionHandler.DeletePermissionRoles()
				c.CustomAbort(400, utils.HTTPFailedJSONString("Insert error, maybe duplicated"))
			}
		} else {
			if defaultContextErr != nil {
				logs.Error(defaultContextErr.Error())
			}
			if deploymentTemplateErr != nil {
				logs.Error(deploymentTemplateErr.Error())
			}
			if jobTemplateErr != nil {
				logs.Error(jobTemplateErr.Error())
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

func (c *FunctionSettingController) Delete() {
	var functionSettingJSON = NewFunctionSettingJSON()
	json.Unmarshal(c.Ctx.Input.RequestBody, &functionSettingJSON)
	var targetFunctionSetting models.FunctionSetting
	manager := models.NewModelManager(models.FunctionSetting{})
	manager.FindInstanceByID(functionSettingJSON.ID, &targetFunctionSetting)
	if targetFunctionSetting.ID > 0 {
		err := manager.Delete(&targetFunctionSetting)
		if err == nil {
			templateHandler := models.NewTemplateHandlerManager(&targetFunctionSetting)
			permissionHandler := models.NewPermissionHandlerManager(&targetFunctionSetting)
			templateHandler.DeleteTemplate()
			permissionHandler.DeletePermissionRoles()
			c.Data["json"] = utils.HTTPSuccessJSON()
		} else {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
		}
	} else {
		message := fmt.Sprintf("Cannot find %d", targetFunctionSetting.ID)
		logs.Error(message)
		c.CustomAbort(400, utils.HTTPFailedJSONString(message))
	}
	c.ServeJSON()
}

func (c *FunctionSettingController) Put() {
	var targetFunctionSettingJSON = NewFunctionSettingJSON()
	json.Unmarshal(c.Ctx.Input.RequestBody, &targetFunctionSettingJSON)
	targetFunctionSetting := *targetFunctionSettingJSON.FunctionSetting
	targetFunctionSetting.TemplatePath = app.GetConfig().DataPath
	manager := models.NewModelManager(models.FunctionSetting{})

	var originFunctionSetting models.FunctionSetting
	err := manager.FindInstanceByID(targetFunctionSetting.ID, &originFunctionSetting)

	if err == nil {
		err = models.Valid(targetFunctionSetting)
		if err != nil {
			logs.Error(err.Error())
			c.Data["json"] = utils.HTTPFailedJSON(err.Error())
		} else {
			//Id and name cannot be edited
			targetFunctionSetting.ID = originFunctionSetting.ID
			targetFunctionSetting.Name = originFunctionSetting.Name

			permissionManager := models.NewModelManager(models.Permission{})
			var existPermission []*models.Permission
			permissionManager.All(&existPermission)

			var defaultContextTemplate models.DefaultContextTemplate
			var kubeDeploymentTemplate models.KubeDeploymentTemplate
			var kubeJobTemplate models.KubeJobTemplate
			var permissionRoles models.PermissionRoles
			json.Unmarshal(c.Ctx.Input.RequestBody, &defaultContextTemplate)
			json.Unmarshal(c.Ctx.Input.RequestBody, &kubeDeploymentTemplate)
			json.Unmarshal(c.Ctx.Input.RequestBody, &kubeJobTemplate)
			json.Unmarshal(c.Ctx.Input.RequestBody, &permissionRoles)

			originTemplateHandler := models.NewTemplateHandlerManager(&originFunctionSetting)
			originPermissionHandler := models.NewPermissionHandlerManager(&originFunctionSetting)

			targetTemplateHandler := models.NewTemplateHandlerManager(&targetFunctionSetting)
			targetPermissionHandler := models.NewPermissionHandlerManager(&targetFunctionSetting)

			originDefaultContextTemplate := *originTemplateHandler.GetDefaultContextTemplate()
			var originDeploymentTemplate models.KubeDeploymentTemplate
			var originJobTemplate models.KubeJobTemplate
			var templateErr error

			if originFunctionSetting.Trigger == models.HTTPTrigger {
				originDeploymentTemplate = *originTemplateHandler.GetKubeDeploymentTemplate()
			} else if originFunctionSetting.Trigger == models.EventTrigger {
				originJobTemplate = *originTemplateHandler.GetKubeJobTemplate()
			}
			originTemplateHandler.DeleteTemplate()
			targetTemplateHandler.SaveDefaultContextTemplate(&defaultContextTemplate)
			if targetFunctionSetting.Trigger == models.HTTPTrigger {
				templateErr = targetTemplateHandler.SaveKubeDeploymentTemplate(&kubeDeploymentTemplate)
			} else if targetFunctionSetting.Trigger == models.EventTrigger {
				templateErr = targetTemplateHandler.SaveKubeJobTemplate(&kubeJobTemplate)
			}

			originPermissionRoles := originPermissionHandler.GetPermissionRoles(existPermission)
			originPermissionHandler.DeletePermissionRoles()
			permissionErr := targetPermissionHandler.SavePermissionRoles(&permissionRoles)

			if templateErr == nil && permissionErr == nil {
				err = manager.Update(&targetFunctionSetting)
				if err == nil {
					c.Data["json"] = utils.HTTPSuccessJSON()
				} else {
					logs.Error(err.Error())
					originTemplateHandler.SaveDefaultContextTemplate(&originDefaultContextTemplate)
					if originFunctionSetting.Trigger == models.HTTPTrigger {
						originTemplateHandler.SaveKubeDeploymentTemplate(&originDeploymentTemplate)
					} else if originFunctionSetting.Trigger == models.EventTrigger {
						originTemplateHandler.SaveKubeJobTemplate(&originJobTemplate)
					}
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
				originTemplateHandler.SaveDefaultContextTemplate(&originDefaultContextTemplate)
				if originFunctionSetting.Trigger == models.HTTPTrigger {
					originTemplateHandler.SaveKubeDeploymentTemplate(&originDeploymentTemplate)
				} else if originFunctionSetting.Trigger == models.EventTrigger {
					originTemplateHandler.SaveKubeJobTemplate(&originJobTemplate)
				}
				originPermissionHandler.SavePermissionRoles(originPermissionRoles)
				c.CustomAbort(400, utils.HTTPFailedJSONString("Update error, system failed"))
			}
		}
	} else {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString(fmt.Sprintf("Cannot found labsetting %d", targetFunctionSetting.ID)))
	}
	c.ServeJSON()
}
