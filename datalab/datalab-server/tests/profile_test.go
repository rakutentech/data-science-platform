package test

import (
	"encoding/json"
	"testing"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
	datalabApp "github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/app"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/auth"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/routers"
	"github.com/astaxie/beego"
	. "github.com/smartystreets/goconvey/convey"
)

func TestProfileAPI(t *testing.T) {
	proxy := RequestProxy{
		Username:   "User2",
		Password:   "User2",
		RememberMe: true,
	}

	beego.Trace("testing", "TestProfileAPI")

	loginStatus := proxy.Login("/auth")

	Convey("Subject: Test TestProfileAPI Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/profile")
		Convey("Response Code should be 200", func() {
			So(response.Code, ShouldEqual, 200)
			var profile *datalabApp.UserProfile
			json.Unmarshal(response.Body.Bytes(), &profile)
			So(profile.ID, ShouldEqual, 2)
			So(profile.Username, ShouldEqual, "User2")
			So(profile.Password, ShouldEqual, "")
			So(profile.AuthType, ShouldEqual, "Database")
			So(profile.Group, ShouldEqual, "test2")
			So(profile.Namespace, ShouldEqual, "n2")
			So(profile.UserToken, ShouldEqual, "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
			Convey("Decode user token", func() {
				user2 := new(auth.TokenManager).FetchUserFromToken(profile.UserToken, app.GetConfig().TokenKey)
				So(user2.ID, ShouldEqual, 2)
				So(user2.Username, ShouldEqual, "User2")
				So(user2.Password, ShouldEqual, "")
				So(user2.AuthType, ShouldEqual, "Database")
				So(user2.Group, ShouldEqual, "test2")
				So(user2.Namespace, ShouldEqual, "n2")
			})
		})
	})
}
