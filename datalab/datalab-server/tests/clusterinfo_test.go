package test

import (
	"encoding/json"
	"testing"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/kubernetes"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/routers"

	"github.com/astaxie/beego"
	. "github.com/smartystreets/goconvey/convey"
)

// GetDataLab is a sample to run an endpoint test
func TestClusterInfoAPI(t *testing.T) {

	proxy := RequestProxy{
		Username:   "admin",
		Password:   "admin",
		RememberMe: true,
	}

	beego.Trace("testing", "TestClusterInfoAPI")

	loginStatus := proxy.Login("/admin/auth")

	Convey("Subject: Test TestClusterInfoAPI Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/admin/clusterinfo")
		Convey("Response Code should be 200", func() {
			So(response.Code, ShouldEqual, 200)
			var result *kubernetes.ClusterInfo
			err := json.Unmarshal(response.Body.Bytes(), &result)
			So(err, ShouldBeNil)
			So(result.CPUTotal, ShouldEqual, 0)
			So(len(result.Groups), ShouldEqual, 3)
			So(len(result.Namespaces), ShouldEqual, 3)
		})
	})
}
