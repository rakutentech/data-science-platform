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
func TestStorageAPI(t *testing.T) {

	proxy := RequestProxy{
		Username:   "admin",
		Password:   "admin",
		RememberMe: true,
	}

	beego.Trace("testing", "TestingStorageAPI")

	loginStatus := proxy.Login("/admin/auth")

	Convey("Subject: Test DataLab Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/admin/storages")
		Convey("Response should include one result", func() {
			So(response.Code, ShouldEqual, 200)
			var result []*models.Storage
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 1)
		})
		Convey("Subject: Add New Storage", func() {
			storage := `
			{
				"Label": "10 GB",
				"Value": 10
		 	}`
			response = proxy.Post("/admin/storages", []byte(storage))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/storages")
			Convey("Response should include one results", func() {
				var result []*models.Storage
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 2)
				So(result[1].ID, ShouldEqual, 2)
				So(result[1].Label, ShouldEqual, "10 GB")
				So(result[1].Value, ShouldEqual, 10)
			})
		})
		Convey("Subject: Add Another Storage", func() {
			storage := `
			{
				"Label": "50 GB",
				"Value": 50
		 	}`
			response = proxy.Post("/admin/storages", []byte(storage))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/storages")
			Convey("Response should include one results", func() {
				var result []*models.Storage
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 3)
				So(result[2].ID, ShouldEqual, 3)
				So(result[2].Label, ShouldEqual, "50 GB")
				So(result[2].Value, ShouldEqual, 50)
			})
		})
		Convey("Subject: Delete Storage", func() {
			storage := `
		  	{
				"ID": 3
		  	}`
			response = proxy.Delete("/admin/storages", []byte(storage))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/storages")
			Convey("Response should include one results", func() {
				var result []*models.Storage
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 2)
				So(result[1].ID, ShouldEqual, 2)
				So(result[1].Label, ShouldEqual, "10 GB")
				So(result[1].Value, ShouldEqual, 10)
			})
		})
		Convey("Subject: Edit Storage Setting", func() {
			storage := `
		  	{
				"ID": 1,
				"Label": "100 GB",
				"Value": 100
		  	}`
			response = proxy.Put("/admin/storages", []byte(storage))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/storages")
			Convey("Response should include one results", func() {
				var result []*models.Storage
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 2)
				So(result[0].ID, ShouldEqual, 1)
				So(result[0].Label, ShouldEqual, "100 GB")
				So(result[0].Value, ShouldEqual, 100)
			})
		})
	})
}
