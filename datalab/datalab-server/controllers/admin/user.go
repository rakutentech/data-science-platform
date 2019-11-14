package admin

import (
	"encoding/json"
	"fmt"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/utils"
	"github.com/astaxie/beego"
	"github.com/astaxie/beego/logs"
)

type UserController struct {
	beego.Controller
}

// Get function
// @Title Get
// @Description Get user
// @Param  None
// @Success 200 User list
// @Failure 403 body is empty
// @router / [get]
func (c *UserController) Get() {
	userManager := models.NewModelManager(models.User{})
	var users []*models.User
	userManager.All(&users)
	c.Data["json"] = users
	c.ServeJSON()
}

// Post function
// @Title Post
// @Description add a new users
// @Param	body		body 	models.User	true		"body for user content"
// @Success 200 {int} models.User.Id
// @Failure 403 body is empty
// @router / [post]
func (c *UserController) Post() {
	var user models.User
	json.Unmarshal(c.Ctx.Input.RequestBody, &user)
	err := models.Valid(user)
	if err != nil {
		logs.Error(err.Error())
		c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
	} else {
		manager := models.NewModelManager(models.User{})
		if err := manager.Create(&user); err == nil {
			c.Data["json"] = utils.HTTPSuccessJSON()
		} else {
			c.CustomAbort(400, utils.HTTPFailedJSONString("Insert error, maybe duplicated"))
		}
	}
	c.ServeJSON()
}

// Delete function
// @Title Delete
// @Description delete users
// @Param	body		body 	models.User	true		"body for user content"
// @Success 200 {int} models.User.Id
// @Failure 403 body is empty
// @router / [delete]
func (c *UserController) Delete() {
	var user models.User
	json.Unmarshal(c.Ctx.Input.RequestBody, &user)
	userManager := models.NewModelManager(models.User{})
	var targetUser models.User
	userManager.FindInstanceByID(user.ID, &targetUser)
	if targetUser.ID > 0 {
		err := userManager.Delete(&targetUser)
		if err == nil {
			c.Data["json"] = utils.HTTPSuccessJSON()
		} else {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
		}
	} else {
		message := fmt.Sprintf("Cannot find user %d", targetUser.ID)
		logs.Error(message)
		c.CustomAbort(400, utils.HTTPFailedJSONString(message))
	}
	c.ServeJSON()
}

// Put function
// @Title Put
// @Description Edit users
// @Param	body		body 	models.User	true		"body for user content"
// @Success 200 {int} models.User.Id
// @Failure 403 body is empty
// @router / [delete]
func (c *UserController) Put() {
	var user models.User
	json.Unmarshal(c.Ctx.Input.RequestBody, &user)
	userManager := models.NewModelManager(models.User{})
	var targetUser models.User
	userManager.FindInstanceByID(user.ID, &targetUser)
	if targetUser.ID > 0 {
		err := models.Valid(&targetUser)
		if err != nil {
			logs.Error(err.Error())
			c.CustomAbort(400, utils.HTTPFailedJSONString(err.Error()))
		} else {
			targetUser = models.User(user)
			userManager.Update(&targetUser)
			c.Data["json"] = utils.HTTPSuccessJSON()
		}
	} else {
		message := fmt.Sprintf("Cannot find user %d", targetUser.ID)
		logs.Error(message)
		c.CustomAbort(400, utils.HTTPFailedJSONString(message))
	}
	c.ServeJSON()
}
