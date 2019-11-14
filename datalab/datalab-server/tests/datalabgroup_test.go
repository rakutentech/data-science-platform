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
func TestDatalabGroupAPI(t *testing.T) {

	proxy := RequestProxy{
		Username:   "admin",
		Password:   "admin",
		RememberMe: true,
	}

	beego.Trace("testing", "TestingDatalabGroupAPI")

	loginStatus := proxy.Login("/admin/auth")

	Convey("Subject: Test DataLab Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/admin/datalabgroups")
		Convey("Response should include no result", func() {
			So(response.Code, ShouldEqual, 200)
			var result []*models.DatalabGroup
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 0)
		})
		Convey("Subject: Add New Datalab Group", func() {
			lab := `
			{
				"Name": "DSD"
		 	}`
			response = proxy.Post("/admin/datalabgroups", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/datalabgroups")
			Convey("Response should include one results", func() {
				var result []*models.DatalabGroup
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 1)
				So(result[0].ID, ShouldEqual, 1)
				So(result[0].Name, ShouldEqual, "DSD")
			})
		})
		Convey("Subject: Add Another Datalab Group", func() {
			lab := `
			{
				"Name": "Common"
		 	}`
			response = proxy.Post("/admin/datalabgroups", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/datalabgroups")
			Convey("Response should include one results", func() {
				var result []*models.DatalabGroup
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 2)
				So(result[1].ID, ShouldEqual, 2)
				So(result[1].Name, ShouldEqual, "Common")
			})
		})
		Convey("Subject: Delete Datalab Group", func() {
			lab := `
		  	{
				"ID": 2
		  	}`
			response = proxy.Delete("/admin/datalabgroups", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/datalabgroups")
			Convey("Response should include one results", func() {
				var result []*models.DatalabGroup
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 1)
				So(result[0].ID, ShouldEqual, 1)
				So(result[0].Name, ShouldEqual, "DSD")
			})
		})
		Convey("Subject: Edit Datalab Group", func() {
			lab := `
		  	{
				"ID": 1,
				"Name": "CDNA"
		  	}`
			response = proxy.Put("/admin/datalabgroups", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/datalabgroups")
			Convey("Response should include one results", func() {
				var result []*models.DatalabGroup
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 1)
				So(result[0].ID, ShouldEqual, 1)
				So(result[0].Name, ShouldEqual, "CDNA")
			})
		})
	})
}
