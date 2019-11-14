package test

import (
	"encoding/json"
	"testing"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/routers"
	"github.com/astaxie/beego"
	. "github.com/smartystreets/goconvey/convey"
)

func initTestAppStorage() {
	manager := models.NewModelManager(models.Storage{})
	manager.DeleteWhere("storage", "1=1") // Clear old data
	proxy := RequestProxy{
		Username:   "admin",
		Password:   "admin",
		RememberMe: true,
	}
	proxy.Login("/admin/auth")
	storage := `
			{
				"Label": "50 GB",
				"Value": 50
		 	}`
	proxy.Post("/admin/storages", []byte(storage))
}

func TestUserStroageAPI(t *testing.T) {
	initTestAppStorage()
	proxy := RequestProxy{
		Username:   "User2",
		Password:   "User2",
		RememberMe: true,
	}

	beego.Trace("testing", "TestUserStroageAPI")

	loginStatus := proxy.Login("/auth")

	Convey("Subject: Test TestUserStroageAPI Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/storages")
		Convey("Response Code should be 200", func() {
			So(response.Code, ShouldEqual, 200)
			var result []*models.Storage
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 1)
			So(result[0].Label, ShouldEqual, "50 GB")
			So(result[0].Value, ShouldEqual, 50)
		})
	})
}
