package test

import (
	"encoding/json"
	"testing"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/routers"

	"github.com/astaxie/beego"
	. "github.com/smartystreets/goconvey/convey"
)

// GetDataLab is a sample to run an endpoint test
func TestInstanceGroupAPI(t *testing.T) {

	proxy := RequestProxy{
		Username:   "admin",
		Password:   "admin",
		RememberMe: true,
	}

	beego.Trace("testing", "TestingInstanceGroupAPI")

	loginStatus := proxy.Login("/admin/auth")

	Convey("Subject: Test DataLab Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/admin/instancetypegroups")
		Convey("Response should include no result", func() {
			So(response.Code, ShouldEqual, 200)
			var result []*models.InstanceGroup
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 0)
		})
		Convey("Subject: Add New Instance Group", func() {
			lab := `
			{
				"Name": "Standard"
		 	}`
			response = proxy.Post("/admin/instancetypegroups", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/instancetypegroups")
			Convey("Response should include one results", func() {
				var result []*models.InstanceGroup
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 1)
				So(result[0].ID, ShouldEqual, 1)
				So(result[0].Name, ShouldEqual, "Standard")
			})
		})
		Convey("Subject: Add Another Instance Group", func() {
			lab := `
			{
				"Name": "Computing"
		 	}`
			response = proxy.Post("/admin/instancetypegroups", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/instancetypegroups")
			Convey("Response should include one results", func() {
				var result []*models.InstanceGroup
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 2)
				So(result[1].ID, ShouldEqual, 2)
				So(result[1].Name, ShouldEqual, "Computing")
			})
		})
		Convey("Subject: Delete Instance Group", func() {
			lab := `
		  	{
				"ID": 2
		  	}`
			response = proxy.Delete("/admin/instancetypegroups", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/instancetypegroups")
			Convey("Response should include one results", func() {
				var result []*models.InstanceGroup
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 1)
				So(result[0].ID, ShouldEqual, 1)
				So(result[0].Name, ShouldEqual, "Standard")
			})
		})
		Convey("Subject: Edit Instance Group", func() {
			lab := `
		  	{
				"ID": 1,
				"Name": "Standard"
		  	}`
			response = proxy.Put("/admin/instancetypegroups", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/instancetypegroups")
			Convey("Response should include one results", func() {
				var result []*models.InstanceGroup
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 1)
				So(result[0].ID, ShouldEqual, 1)
				So(result[0].Name, ShouldEqual, "Standard")
			})
		})
	})
}
