package admin

import (
	"encoding/json"
	"fmt"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/utils"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/logs"
)

type StorageController struct {
	beego.Controller
}

// Get function
// @Title Get
func (c *StorageController) Get() {
	storageManager := models.NewModelManager(models.Storage{})
	var storages []*models.Storage
	storageManager.All(&storages)
	c.Data["json"] = storages
	c.ServeJSON()
}

// Post function
// @Title Post
func (c *StorageController) Post() {
	var storage models.Storage
	json.Unmarshal(c.Ctx.Input.RequestBody, &storage)
	err := models.Valid(storage)
	if err != nil {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
	} else {
		manager := models.NewModelManager(models.Storage{})
		if err := manager.Create(&storage); err == nil {
			c.Data["json"] = utils.HTTPSuccessJSON()
		} else {
			c.CustomAbort(400, utils.HTTPFailedJSONString("Insert error, maybe duplicated"))
		}
	}
	c.ServeJSON()
}

// Delete function
// @Title Delete
func (c *StorageController) Delete() {
	var storage models.Storage
	json.Unmarshal(c.Ctx.Input.RequestBody, &storage)
	storageManager := models.NewModelManager(models.Storage{})
	var targetStorage models.Storage
	storageManager.FindInstanceByID(storage.ID, &targetStorage)
	if targetStorage.ID > 0 {
		err := storageManager.Delete(&targetStorage)
		if err == nil {
			c.Data["json"] = utils.HTTPSuccessJSON()
		} else {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
		}
	} else {
		message := fmt.Sprintf("Cannot find user %d", targetStorage.ID)
		logs.Error(message)
		c.CustomAbort(400, utils.HTTPFailedJSONString(message))
	}
	c.ServeJSON()
}

// Put function
// @Title Put
func (c *StorageController) Put() {
	var storage models.Storage
	json.Unmarshal(c.Ctx.Input.RequestBody, &storage)
	storageManager := models.NewModelManager(models.Storage{})
	var targetStorage models.Storage
	storageManager.FindInstanceByID(storage.ID, &targetStorage)
	if targetStorage.ID > 0 {
		err := models.Valid(&targetStorage)
		if err != nil {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
		} else {
			targetStorage = models.Storage(storage)
			storageManager.Update(&targetStorage)
			c.Data["json"] = utils.HTTPSuccessJSON()
		}
	} else {
		message := fmt.Sprintf("Cannot find storage %d", targetStorage.ID)
		logs.Error(message)
		c.CustomAbort(400, utils.HTTPFailedJSONString(message))
	}
	c.ServeJSON()
}
