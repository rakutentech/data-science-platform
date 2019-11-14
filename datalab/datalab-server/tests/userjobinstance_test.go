package test

import (
	"encoding/json"
	"testing"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/routers"
	"github.com/astaxie/beego"
	. "github.com/smartystreets/goconvey/convey"
)

func TestUserJobInstanceAPI(t *testing.T) {

	ClearUserData()
	InitTestAppFunctionSetting()
	InitTestAppInstanceType()
	proxy := RequestProxy{
		Username:   "User2",
		Password:   "User2",
		RememberMe: true,
	}

	beego.Trace("testing", "TestUserJobInstanceAPI")

	loginStatus := proxy.Login("/auth")

	Convey("Subject: Test TestUserJobInstanceAPI Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})

		Convey("Subject: Test Create job instance", func() {
			data := `
			{
				"FunctionName": "MyFun2",
				"Name": "myfunc2",             
				"InstanceTypeName": "t3",
				"Trigger": "event",
				"FunctionContextType": "git",
				"FunctionContext": {
				  "GitRepo":       "git://myrepo",
				  "GitBranch":     "master",
				  "GitEntrypoint": "entrypoint.sh"
				},
				"Tags": {
					"env": "stg"
				}
			 }
		`
			response := proxy.Post("/function/instances", []byte(data))
			So(response.Code, ShouldEqual, 200)

			data = `
			{
				"command": "echo test"
			 }		`
			response = proxy.Post("/apis/User2/myfunc2", []byte(data))
			So(response.Code, ShouldEqual, 200)
			var result map[string]string
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result["jobID"]), ShouldBeGreaterThan, 0)
		})

		Convey("Subject: Read job instance", func() {
			response := proxy.Get("/function/instances/event/myfunc2/jobs")
			So(response.Code, ShouldEqual, 200)
			var result []*models.JobInstance
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 1)
			So(result[0].InstanceName, ShouldEqual, "myfunc2")
			So(result[0].Status, ShouldEqual, "Pending")
			So(result[0].Parameters, ShouldEqual, "{\"command\":\"echo test\"}")

		})
		Convey("Subject: Read job instance detail kill it", func() {
			response := proxy.Get("/function/instances/event/myfunc2/jobs")
			So(response.Code, ShouldEqual, 200)
			var result []*models.JobInstance
			json.Unmarshal(response.Body.Bytes(), &result)
			response = proxy.Get("/function/instances/event/myfunc2/jobs/" + result[0].JobID)
			So(response.Code, ShouldEqual, 200)
			var job models.JobInstance
			json.Unmarshal(response.Body.Bytes(), &job)
			So(result[0].JobID, ShouldEqual, job.JobID)
			So(result[0].InstanceName, ShouldEqual, job.InstanceName)
			So(result[0].Status, ShouldEqual, job.Status)
			So(result[0].Parameters, ShouldEqual, job.Parameters)
			So(job.Status, ShouldEqual, "Pending")
			response = proxy.Delete("/function/instances/event/myfunc2/jobs/"+result[0].JobID+"/kill", nil)
			So(response.Code, ShouldEqual, 200)
			response = proxy.Get("/function/instances/event/myfunc2/jobs/" + result[0].JobID)
			json.Unmarshal(response.Body.Bytes(), &job)
			So(job.Status, ShouldEqual, "Killed")
		})
		Convey("Subject: Read job instance log", func() {
			response := proxy.Get("/function/instances/event/myfunc2/jobs")
			So(response.Code, ShouldEqual, 200)
			var result []*models.JobInstance
			json.Unmarshal(response.Body.Bytes(), &result)
			response = proxy.Get("/function/instances/event/myfunc2/jobs/" + result[0].JobID + "/log")
			So(response.Code, ShouldEqual, 200)
			response = proxy.Get("/function/instances/event/myfunc2/jobs/xxx/log")
			So(response.Code, ShouldEqual, 400)
		})
	})
}
