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
func TestGroupAPI(t *testing.T) {

	proxy := RequestProxy{
		Username:   "admin",
		Password:   "admin",
		RememberMe: true,
	}

	beego.Trace("testing", "TestingGroupAPI")

	loginStatus := proxy.Login("/admin/auth")

	Convey("Subject: Test DataLab Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/admin/groups")
		Convey("Response should include no result", func() {
			So(response.Code, ShouldEqual, 200)
			var result []*models.Group
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 0)
		})
		Convey("Subject: Add New Group", func() {
			lab := `
			{
				"Name": "group1"
		 	}`
			response = proxy.Post("/admin/groups", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/groups")
			Convey("Response should include one results", func() {
				var result []*models.Group
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 1)
				So(result[0].ID, ShouldEqual, 1)
				So(result[0].Name, ShouldEqual, "group1")
			})
		})
		Convey("Subject: Add Another Group", func() {
			lab := `
			{
				"Name": "group2"
		 	}`
			response = proxy.Post("/admin/groups", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/groups")
			Convey("Response should include one results", func() {
				var result []*models.Group
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 2)
				So(result[1].ID, ShouldEqual, 2)
				So(result[1].Name, ShouldEqual, "group2")
			})
		})
		Convey("Subject: Delete Group", func() {
			lab := `
		  	{
				"ID": 2
		  	}`
			response = proxy.Delete("/admin/groups", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/groups")
			Convey("Response should include one results", func() {
				var result []*models.Group
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 1)
				So(result[0].ID, ShouldEqual, 1)
				So(result[0].Name, ShouldEqual, "group1")
			})
		})
		Convey("Subject: Edit  Group", func() {
			lab := `
		  	{
				"ID": 1,
				"Name": "group2"
		  	}`
			response = proxy.Put("/admin/groups", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/groups")
			Convey("Response should include one results", func() {
				var result []*models.Group
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 1)
				So(result[0].ID, ShouldEqual, 1)
				So(result[0].Name, ShouldEqual, "group2")
			})
		})
	})
}
