package app

import (
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/auth"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/kubernetes"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/astaxie/beego"
)

type AppController struct {
	beego.Controller
}

type UserProfile struct {
	models.User
	UserToken string
}

func (c *AppController) GetProfile() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	user.Password = "" // Hide passwords information
	c.Data["json"] = &UserProfile{
		User:      user,
		UserToken: new(auth.TokenManager).BuildUserToken(user, app.GetConfig().TokenKey),
	}
	c.ServeJSON()
}

func (c *AppController) GetResourceQuota() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	c.Data["json"] = kubernetes.GetNamespaceResource(user.Namespace)
	c.ServeJSON()
}

func (c *AppController) GetStorages() {
	storageManager := models.NewModelManager(models.Storage{})
	var storages []*models.Storage
	storageManager.All(&storages)
	c.Data["json"] = storages
	c.ServeJSON()
}

type InstanceTypeSettingJSON struct {
	ID          int
	Name        string
	Description string
	Group       string
	CPU         float64
	GPU         float64
	Memory      int64
	MemoryScale string
}

func (c *AppController) GetInstanceTypes() {
	user := c.Ctx.Input.GetData(auth.UserKey).(models.User)
	instanceTypes := GetAccessibleInstanceTypes(user)
	instanceTypeSettings := []InstanceTypeSettingJSON{}
	for _, instanceType := range instanceTypes {
		instanceTypeJSON := InstanceTypeSettingJSON{
			ID:          instanceType.ID,
			Name:        instanceType.Name,
			Description: instanceType.Description,
			Group:       instanceType.Group,
			CPU:         instanceType.CPU,
			GPU:         instanceType.GPU,
			Memory:      instanceType.Memory,
			MemoryScale: instanceType.MemoryScale,
		}
		instanceTypeSettings = append(instanceTypeSettings, instanceTypeJSON)
	}

	c.Data["json"] = instanceTypeSettings
	c.ServeJSON()
}

func GetAccessibleInstanceTypes(user models.User) []*models.InstanceType {

	instanceTypeManager := models.NewModelManager(models.InstanceType{})
	permissionManager := models.NewModelManager(models.Permission{})
	var instanceTypes []*models.InstanceType
	instanceTypeManager.All(&instanceTypes)
	var existPermission []*models.Permission
	permissionManager.All(&existPermission)
	result := []*models.InstanceType{}
	for _, instanceType := range instanceTypes {
		permissionHandler := models.NewPermissionHandlerManager(instanceType)
		if instanceType.Public || permissionHandler.CheckPermissionRoles(existPermission, user) {
			result = append(result, instanceType)
		}
	}
	return result
}
