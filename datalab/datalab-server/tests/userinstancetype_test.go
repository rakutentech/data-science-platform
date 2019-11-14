package test

import (
	"encoding/json"
	"testing"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/routers"
	"github.com/astaxie/beego"
	. "github.com/smartystreets/goconvey/convey"
)

func TestUserInstanceTypeAPI(t *testing.T) {

	ClearUserData()
	InitTestAppInstanceType()
	proxy := RequestProxy{
		Username:   "User2",
		Password:   "User2",
		RememberMe: true,
	}

	beego.Trace("testing", "TestUserInstanceTypeAPI")

	loginStatus := proxy.Login("/auth")

	Convey("Subject: Test TestUserInstanceTypeAPI Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/instancetypes")
		Convey("Response Code should be 200", func() {
			So(response.Code, ShouldEqual, 200)
			var result []*models.InstanceType
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 2)
			So(result[0].Name, ShouldEqual, "t2")
			So(result[0].CPU, ShouldEqual, 2)
			So(result[0].GPU, ShouldEqual, 2)
			So(result[0].Memory, ShouldEqual, 256)
			So(result[0].MemoryScale, ShouldEqual, "MiB")
			So(result[1].Name, ShouldEqual, "t3")
			So(result[1].CPU, ShouldEqual, 1.5)
			So(result[1].GPU, ShouldEqual, 1)
			So(result[1].Memory, ShouldEqual, 128)
			So(result[1].MemoryScale, ShouldEqual, "GiB")
		})
	})
}
