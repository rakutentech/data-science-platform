package admin

import (
	"encoding/json"
	"fmt"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/utils"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/logs"
)

type GroupController struct {
	beego.Controller
}

// Get function
// @Title Get
func (c *GroupController) Get() {
	groupManager := models.NewModelManager(models.Group{})
	var groups []*models.Group
	groupManager.All(&groups)
	c.Data["json"] = groups
	c.ServeJSON()
}

// Post function
// @Title Post
func (c *GroupController) Post() {
	var group models.Group
	json.Unmarshal(c.Ctx.Input.RequestBody, &group)
	err := models.Valid(group)
	if err != nil {
		logs.Error(err.Error())
		c.Data["json"] = utils.HTTPFailedJSON(err.Error())
	} else {
		manager := models.NewModelManager(models.Group{})
		if err := manager.Create(&group); err == nil {
			c.Data["json"] = utils.HTTPSuccessJSON()
		} else {
			c.CustomAbort(400, utils.HTTPFailedJSONString("Insert error, maybe duplicated"))
		}
	}
	c.ServeJSON()
}

// Delete function
// @Title Delete
func (c *GroupController) Delete() {
	var group models.Group
	json.Unmarshal(c.Ctx.Input.RequestBody, &group)
	groupManager := models.NewModelManager(models.Group{})
	var targetGroup models.Group
	groupManager.FindInstanceByID(group.ID, &targetGroup)
	if targetGroup.ID > 0 {
		err := groupManager.Delete(&targetGroup)
		if err == nil {
			c.Data["json"] = utils.HTTPSuccessJSON()
		} else {
			logs.Error(err.Error())
			c.Data["json"] = utils.HTTPFailedJSON(err.Error())
		}
	} else {
		message := fmt.Sprintf("Cannot find user %d", targetGroup.ID)
		logs.Error(message)
		c.CustomAbort(400, utils.HTTPFailedJSONString(message))
	}
	c.ServeJSON()
}

// Put function
// @Title Put
func (c *GroupController) Put() {
	var group models.Group
	json.Unmarshal(c.Ctx.Input.RequestBody, &group)
	groupManager := models.NewModelManager(models.Group{})
	var targetGroup models.Group
	groupManager.FindInstanceByID(group.ID, &targetGroup)
	if targetGroup.ID > 0 {
		err := models.Valid(&targetGroup)
		if err != nil {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
		} else {
			targetGroup = models.Group(group)
			groupManager.Update(&targetGroup)
			c.Data["json"] = utils.HTTPSuccessJSON()
		}
	} else {
		message := fmt.Sprintf("Cannot find target group %d", targetGroup.ID)
		logs.Error(message)
		c.CustomAbort(400, utils.HTTPFailedJSONString(message))
	}
	c.ServeJSON()
}
