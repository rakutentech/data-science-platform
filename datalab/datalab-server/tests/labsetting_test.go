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
func TestLabSettingAPI(t *testing.T) {

	proxy := RequestProxy{
		Username:   "admin",
		Password:   "admin",
		RememberMe: true,
	}

	beego.Trace("testing", "TestLabSettingAPI")

	loginStatus := proxy.Login("/admin/auth")

	Convey("Subject: Test DataLab Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/admin/datalab")
		Convey("Response should include one result", func() {
			So(response.Code, ShouldEqual, 200)
			var result []*admin.LabSettingJSON
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 1)
			So(result[0].ID, ShouldEqual, 1)
			So(result[0].Group, ShouldEqual, "group1")
			So(result[0].DeploymentTemplate, ShouldEqual, "DeploymentTemplate")
			So(result[0].TemplatePath, ShouldEqual, "./data")
			So(result[0].AccessibleUsers[0], ShouldEqual, "user1")
			So(result[0].AccessibleGroups[0], ShouldEqual, "group1")
		})
		Convey("Subject: Create New LabSetting", func() {
			lab := `
		{
			"Name": "mylab3",
			"Description": "test Lab",
			"LoadBalancer": "dummy",
			"Group": "Lab",
			"DeploymentTemplate": "dd",
			"ServiceTemplate": "ss",
			"IngressTemplate": "ii",
			"Public": false,
			"AccessibleUsers": [
			  "user-a"
			],
			"AccessibleGroups": [
			  "group-a"
			]
		  }`
			response = proxy.Post("/admin/datalab", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/datalab")
			Convey("Response should include two results", func() {
				var result []*admin.LabSettingJSON
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 2)
				So(result[0].ID, ShouldEqual, 1)
				So(result[1].ID, ShouldEqual, 2)
				So(result[1].Group, ShouldEqual, "Lab")
				So(result[1].DeploymentTemplate, ShouldEqual, "dd")
				So(result[1].TemplatePath, ShouldEqual, "./data")
				So(result[1].AccessibleUsers[0], ShouldEqual, "user-a")
				So(result[1].AccessibleGroups[0], ShouldEqual, "group-a")
			})
		})
		Convey("Subject: Delete LabSetting", func() {
			lab := `
		  {
			"ID": 1
		  }`
			response = proxy.Delete("/admin/datalab", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/datalab")
			Convey("Response should include one results", func() {
				var result []*admin.LabSettingJSON
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 1)
				So(result[0].ID, ShouldEqual, 2)
				So(result[0].Group, ShouldEqual, "Lab")
				So(result[0].DeploymentTemplate, ShouldEqual, "dd")
				So(result[0].TemplatePath, ShouldEqual, "./data")
				So(result[0].AccessibleUsers[0], ShouldEqual, "user-a")
				So(result[0].AccessibleGroups[0], ShouldEqual, "group-a")
			})
		})
		Convey("Subject: Edit LabSetting", func() {
			lab := `
		  {
			   "ID": 2,
			   "Name": "mylab3",
			   "Description": "test Lab2",
			   "LoadBalancer": "dummy2",
			   "Group": "Lab",
			   "DeploymentTemplate": "dd2",
			   "ServiceTemplate": "ss2",
			   "IngressTemplate": "ii2",
			   "Public": false,
			   "AccessibleUsers": [
			     "user-b"
			   ],
			   "AccessibleGroups": [
			     "group-b"
			   ]
		  }`
			response = proxy.Put("/admin/datalab", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/datalab")
			Convey("Response should include one results", func() {
				var result []*admin.LabSettingJSON
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 1)
				So(result[0].ID, ShouldEqual, 2)
				So(result[0].Description, ShouldEqual, "test Lab2")
				So(result[0].DeploymentTemplate, ShouldEqual, "dd2")
				So(result[0].LoadBalancer, ShouldEqual, "dummy2")
				So(result[0].AccessibleUsers[0], ShouldEqual, "user-b")
				So(result[0].AccessibleGroups[0], ShouldEqual, "group-b")
			})
		})
	})
}
