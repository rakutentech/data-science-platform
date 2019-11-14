package test

import (
	"encoding/json"
	"testing"

	app "github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/app"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/routers"
	"github.com/astaxie/beego"
	. "github.com/smartystreets/goconvey/convey"
)

func TestUserFunctionSettingAPI(t *testing.T) {

	ClearUserData()
	InitTestAppFunctionSetting()
	proxy := RequestProxy{
		Username:   "User2",
		Password:   "User2",
		RememberMe: true,
	}

	beego.Trace("testing", "TestUserFunctionSettingAPI")

	loginStatus := proxy.Login("/auth")

	Convey("Subject: Test TestUserFunctionSettingAPI Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/function")
		Convey("Response Code should be 200", func() {
			So(response.Code, ShouldEqual, 200)
			var result []*app.FunctionSettingJSON
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 3)
			So(result[0].Name, ShouldEqual, "MyFun2")
			So(result[0].Description, ShouldEqual, "test func2")
			So(result[0].ProgramLanguage, ShouldEqual, "python")
			So(result[0].LoadBalancer, ShouldEqual, "dummy2")
			So(result[0].Trigger, ShouldEqual, "http")
			So(result[0].DefaultFunction, ShouldEqual, "func2")
			So(result[0].DefaultRequirement, ShouldEqual, "req2")
			So(result[1].Name, ShouldEqual, "MyFun3")
			So(result[1].Description, ShouldEqual, "test func3")
			So(result[1].ProgramLanguage, ShouldEqual, "python")
			So(result[1].LoadBalancer, ShouldEqual, "dummy3")
			So(result[1].Trigger, ShouldEqual, "http")
			So(result[1].DefaultFunction, ShouldEqual, "func3")
			So(result[1].DefaultRequirement, ShouldEqual, "req3")
			So(result[2].Name, ShouldEqual, "MyFun4")
			So(result[2].Description, ShouldEqual, "test func4")
			So(result[2].ProgramLanguage, ShouldEqual, "python")
			So(result[2].LoadBalancer, ShouldEqual, "dummy4")
			So(result[2].Trigger, ShouldEqual, "http")
			So(result[2].DefaultFunction, ShouldEqual, "func4")
			So(result[2].DefaultRequirement, ShouldEqual, "req4")
		})
	})
}
