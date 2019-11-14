// @APIVersion 1.0.0
// @Title beego Test API
// @Description beego has a very cool tools to autogenerate documents for your API
// @Contact astaxie@gmail.com
// @TermsOfServiceUrl http://beego.me/
// @License Apache 2.0
// @LicenseUrl http://www.apache.org/licenses/LICENSE-2.0.html
package routers

import (
	"fmt"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/admin"
	datalabApp "github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/app"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/auth"
	"github.com/astaxie/beego"
)

/*
* Note.
* Router function beego.include cannot work with go module
* Refactory router if beego.include be supported
 */
func init() {

	beego.InsertFilter("/*", beego.BeforeRouter, auth.Authenticate)

	beego.Router("/auth", &auth.AuthController{}, "post:Auth")
	beego.Router("/profile", &datalabApp.AppController{}, "get:GetProfile")
	beego.Router("/resourcequota", &datalabApp.AppController{}, "get:GetResourceQuota")
	beego.Router("/storages", &datalabApp.AppController{}, "get:GetStorages")
	beego.Router("/instancetypes", &datalabApp.AppController{}, "get:GetInstanceTypes")

	// DataLab Path
	beego.Router("/datalab", &datalabApp.DataLabController{}, "get:GetDataLabSettings")
	beego.Router("/datalab/instances", &datalabApp.DataLabController{})
	beego.Router("/datalab/instances/:typegroup/:typename/:instancename", &datalabApp.DataLabController{}, "get:GetDataLabDetail")
	beego.Router("/datalab/instances/:typegroup/:typename/:instancename/log", &datalabApp.DataLabController{}, "get:GetDataLabLog")

	// Function Path
	beego.Router("/function", &datalabApp.FunctionController{}, "get:GetFunctionSettings")
	beego.Router("/function/instances", &datalabApp.FunctionController{})
	beego.Router("/function/instances/:trigger/:instancename", &datalabApp.FunctionController{}, "get:GetFunctionDetail")
	beego.Router("/function/instances/:trigger/:instancename/log", &datalabApp.FunctionController{}, "get:GetFunctionLog")
	beego.Router("/function/instances/:trigger/:instancename/restart", &datalabApp.FunctionController{}, "post:RestartFunction")

	// Job Path
	beego.Router("/function/instances/event/:instancename/jobs", &datalabApp.JobController{})
	beego.Router("/function/instances/event/:instancename/jobs/:jobid", &datalabApp.JobController{}, "get:GetJobDetail")
	beego.Router("/function/instances/event/:instancename/jobs/:jobid/log", &datalabApp.JobController{}, "get:GetJobLog")
	beego.Router("/function/instances/event/:instancename/jobs/:jobid/kill", &datalabApp.JobController{}, "delete:KillJob")
	beego.Router("/apis/:username/:instancename", &datalabApp.JobController{}, "post:SubmitJob")

	// Admin path
	adminPath := app.GetConfig().Admin.URLPath
	beego.Router(fmt.Sprintf("%s/auth", adminPath), &auth.AuthController{}, "post:AdminAuth")
	beego.Router(fmt.Sprintf("%s/clusterinfo", adminPath), &admin.ClusterInfoController{})
	beego.Router(fmt.Sprintf("%s/datalab", adminPath), &admin.LabSettingController{})
	beego.Router(fmt.Sprintf("%s/function", adminPath), &admin.FunctionSettingController{})
	beego.Router(fmt.Sprintf("%s/instancetypes", adminPath), &admin.InstanceTypeController{})
	beego.Router(fmt.Sprintf("%s/users", adminPath), &admin.UserController{})
	beego.Router(fmt.Sprintf("%s/groups", adminPath), &admin.GroupController{})
	beego.Router(fmt.Sprintf("%s/storages", adminPath), &admin.StorageController{})
	beego.Router(fmt.Sprintf("%s/datalabgroups", adminPath), &admin.DatalabGroupController{})
	beego.Router(fmt.Sprintf("%s/instancetypegroups", adminPath), &admin.InstanceTypeGroupController{})
}
