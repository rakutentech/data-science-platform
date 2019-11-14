package test

import (
	"encoding/json"
	"testing"

	app "github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/app"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/routers"
	"github.com/astaxie/beego"
	. "github.com/smartystreets/goconvey/convey"
)

func TestUserLabSettingAPI(t *testing.T) {

	ClearUserData()
	InitTestAppLabSetting()
	proxy := RequestProxy{
		Username:   "User2",
		Password:   "User2",
		RememberMe: true,
	}

	beego.Trace("testing", "TestUserLabSettingAPI")

	loginStatus := proxy.Login("/auth")

	Convey("Subject: Test TestUserLabSettingAPI Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/datalab")
		Convey("Response Code should be 200", func() {
			So(response.Code, ShouldEqual, 200)
			var result []*app.LabSettingJSON
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 3)
			So(result[0].Name, ShouldEqual, "lab2")
			So(result[0].Description, ShouldEqual, "test Lab2")
			So(result[0].Group, ShouldEqual, "Lab")
			So(result[1].Name, ShouldEqual, "lab3")
			So(result[1].Description, ShouldEqual, "test Lab3")
			So(result[1].Group, ShouldEqual, "Lab")
			So(result[2].Name, ShouldEqual, "lab4")
			So(result[2].Description, ShouldEqual, "test Lab4")
			So(result[2].Group, ShouldEqual, "Lab")
		})
	})
}
