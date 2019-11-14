package test

import (
	"encoding/json"
	"testing"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/kubernetes"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/routers"
	"github.com/astaxie/beego"
	. "github.com/smartystreets/goconvey/convey"
)

func TestResourceQuotaAPI(t *testing.T) {
	proxy := RequestProxy{
		Username:   "User2",
		Password:   "User2",
		RememberMe: true,
	}

	beego.Trace("testing", "TestResourceQuotaAPI")

	loginStatus := proxy.Login("/auth")

	Convey("Subject: Test TestResourceQuotaAPI Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/resourcequota")
		Convey("Response Code should be 200", func() {
			So(response.Code, ShouldEqual, 200)
			var quota *kubernetes.ResourceUsage
			err := json.Unmarshal(response.Body.Bytes(), &quota)
			So(quota.CPUTotal, ShouldEqual, 0)
			So(quota.CPUUsage, ShouldEqual, 0)
			So(err, ShouldBeNil)
		})
	})
}
