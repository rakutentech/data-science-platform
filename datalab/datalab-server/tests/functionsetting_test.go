package test

import (
	"encoding/json"
	"testing"

	admin "github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/admin"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/routers"

	"github.com/astaxie/beego"
	. "github.com/smartystreets/goconvey/convey"
)

// GetDataLab is a sample to run an endpoint test
func TestFunctionSettingAPI(t *testing.T) {

	proxy := RequestProxy{
		Username:   "admin",
		Password:   "admin",
		RememberMe: true,
	}

	beego.Trace("testing", "TestFunctionSettingAPI")

	loginStatus := proxy.Login("/admin/auth")

	Convey("Subject: Test Function Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/admin/function")
		Convey("Response should include one result", func() {
			So(response.Code, ShouldEqual, 200)
			var result []*admin.FunctionSettingJSON
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 2)
			So(result[0].ID, ShouldEqual, 1)
			So(result[0].Trigger, ShouldEqual, "http")
			So(result[0].ProgramLanguage, ShouldEqual, "python")
			So(result[0].DeploymentTemplate, ShouldEqual, "DeploymentTemplate")
			So(result[0].JobTemplate, ShouldEqual, "")
			So(result[0].TemplatePath, ShouldEqual, "./data")
			So(result[0].AccessibleUsers[0], ShouldEqual, "user1")
			So(result[0].AccessibleGroups[0], ShouldEqual, "group1")
			So(result[1].ID, ShouldEqual, 2)
			So(result[1].Trigger, ShouldEqual, "event")
			So(result[1].ProgramLanguage, ShouldEqual, "sh")
			So(result[1].DeploymentTemplate, ShouldEqual, "")
			So(result[1].JobTemplate, ShouldEqual, "JobTemplate")
			So(result[1].TemplatePath, ShouldEqual, "./data")
			So(result[1].AccessibleUsers[0], ShouldEqual, "user3")
			So(result[1].AccessibleGroups[0], ShouldEqual, "group2")
		})
		Convey("Subject: Create New FunctionSetting", func() {
			data := `
					{
				  "Name": "MyFun1",
			      "Description": "test func",
			      "ProgramLanguage": "python",
			      "Trigger":"http",
			      "LoadBalancer": "dummy2",
			      "DefaultFunction":"hello world",
			      "DefaultRequirement":"###",
			      "DeploymentTemplate":"dd",
			      "ServiceTemplate":"ss",
			      "IngressTemplate":"ii",
			      "Public": false,
			      "AccessibleUsers": [
			        "user-a"
			      ],
			      "AccessibleGroups": [
			        "group-b"
			      ]
					  }`
			response = proxy.Post("/admin/function", []byte(data))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/function")
			Convey("Response should include two results", func() {
				var result []*admin.FunctionSettingJSON
				json.Unmarshal(response.Body.Bytes(), &result)
				So(result[2].ID, ShouldEqual, 3)
				So(result[2].Trigger, ShouldEqual, "http")
				So(result[2].ProgramLanguage, ShouldEqual, "python")
				So(result[2].DefaultFunction, ShouldEqual, "hello world")
				So(result[2].DefaultRequirement, ShouldEqual, "###")
				So(result[2].DeploymentTemplate, ShouldEqual, "dd")
				So(result[2].JobTemplate, ShouldEqual, "")
				So(result[2].TemplatePath, ShouldEqual, "./data")
				So(result[2].AccessibleUsers[0], ShouldEqual, "user-a")
				So(result[2].AccessibleGroups[0], ShouldEqual, "group-b")
			})
		})
		Convey("Subject: Delete FunctionSetting", func() {
			lab := `
					  {
						"ID": 1
					  }`
			response = proxy.Delete("/admin/function", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/function")
			Convey("Response should include one results", func() {
				var result []*admin.FunctionSettingJSON
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 2)
				So(result[1].ID, ShouldEqual, 3)
				So(result[1].Trigger, ShouldEqual, "http")
				So(result[1].ProgramLanguage, ShouldEqual, "python")
				So(result[1].DeploymentTemplate, ShouldEqual, "dd")
				So(result[1].JobTemplate, ShouldEqual, "")
				So(result[1].TemplatePath, ShouldEqual, "./data")
				So(result[1].AccessibleUsers[0], ShouldEqual, "user-a")
				So(result[1].AccessibleGroups[0], ShouldEqual, "group-b")
			})
		})
		Convey("Subject: Edit Event FunctionSettin", func() {
			data := `
					{
						"ID": 2,
						"Name": "myjob",
			      "Description": "desc 3",
			      "ProgramLanguage": "bash",
			      "Trigger":"event",
			      "DefaultFunction":"test code - 222",
			      "DefaultRequirement":"test requirement - 222",
			      "JobTemplate":"JJ123",
			      "Public": false,
			      "AccessibleUsers": [
			        "user-j1"
			      ],
			      "AccessibleGroups": [
			        "group-j1"
			      ]
					  }`
			response = proxy.Put("/admin/function", []byte(data))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/function")
			Convey("Response should include one results", func() {
				var result []*admin.FunctionSettingJSON
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 2)
				So(result[0].ID, ShouldEqual, 2)
				So(result[0].Trigger, ShouldEqual, "event")
				So(result[0].ProgramLanguage, ShouldEqual, "bash")
				So(result[0].DefaultRequirement, ShouldEqual, "test requirement - 222")
				So(result[0].DefaultFunction, ShouldEqual, "test code - 222")
				So(result[0].DeploymentTemplate, ShouldEqual, "")
				So(result[0].JobTemplate, ShouldEqual, "JJ123")
				So(result[0].TemplatePath, ShouldEqual, "./data")
				So(result[0].AccessibleUsers[0], ShouldEqual, "user-j1")
				So(result[0].AccessibleGroups[0], ShouldEqual, "group-j1")
			})
		})
		Convey("Subject: Edit HTTP FunctionSettin", func() {
			data := `
					{
						"ID": 3,
						"Name": "MyFun1",
			      "Description": "test func",
			      "ProgramLanguage": "java",
			      "Trigger":"http",
			      "LoadBalancer": "dummy2",
			      "DefaultFunction":"hello world",
			      "DefaultRequirement":"###",
			      "DeploymentTemplate":"dd2",
			      "ServiceTemplate":"ss",
			      "IngressTemplate":"ii",
			      "Public": false,
			      "AccessibleUsers": [
			        "user-c"
			      ],
			      "AccessibleGroups": [
			        "group-d"
			      ]
					  }`
			response = proxy.Put("/admin/function", []byte(data))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/function")
			Convey("Response should include one results", func() {
				var result []*admin.FunctionSettingJSON
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 2)
				So(result[1].ID, ShouldEqual, 3)
				So(result[1].Trigger, ShouldEqual, "http")
				So(result[1].ProgramLanguage, ShouldEqual, "java")
				So(result[1].DeploymentTemplate, ShouldEqual, "dd2")
				So(result[1].JobTemplate, ShouldEqual, "")
				So(result[1].TemplatePath, ShouldEqual, "./data")
				So(result[1].AccessibleUsers[0], ShouldEqual, "user-c")
				So(result[1].AccessibleGroups[0], ShouldEqual, "group-d")
			})
		})
	})
}
