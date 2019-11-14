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
func TestUserAPI(t *testing.T) {

	proxy := RequestProxy{
		Username:   "admin",
		Password:   "admin",
		RememberMe: true,
	}

	beego.Trace("testing", "TestingUserAPI")

	loginStatus := proxy.Login("/admin/auth")

	Convey("Subject: Test DataLab Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/admin/users")
		Convey("Response should include no result", func() {
			So(response.Code, ShouldEqual, 200)
			var result []*models.User
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 3)
			So(result[0].ID, ShouldEqual, 1)
			So(result[0].Username, ShouldEqual, "User1")
			So(result[0].AuthType, ShouldEqual, "LDAP")
			So(result[0].Password, ShouldEqual, "User1")
			So(result[0].Group, ShouldEqual, "test1")
			So(result[0].Namespace, ShouldEqual, "n1")
		})
		Convey("Subject: Add New User", func() {
			lab := `
			{
				"Username": "User4",
				"AuthType": "LDAP",
				"Password": "User4",
				"Group": "test4",
				"Namespace": "n4"
		 	}`
			response = proxy.Post("/admin/users", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/users")
			Convey("Response should include one results", func() {
				var result []*models.User
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 4)
				So(result[3].ID, ShouldEqual, 4)
				So(result[3].Username, ShouldEqual, "User4")
				So(result[3].AuthType, ShouldEqual, "LDAP")
				So(result[3].Password, ShouldEqual, "User4")
				So(result[3].Group, ShouldEqual, "test4")
				So(result[3].Namespace, ShouldEqual, "n4")
			})
		})
		Convey("Subject: Delete UserSetting", func() {
			lab := `
		  	{
				"ID": 4
		  	}`
			response = proxy.Delete("/admin/users", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/users")
			Convey("Response should include one results", func() {
				var result []*models.User
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 3)
				So(result[0].ID, ShouldEqual, 1)
				So(result[0].Username, ShouldEqual, "User1")
				So(result[0].AuthType, ShouldEqual, "LDAP")
				So(result[0].Password, ShouldEqual, "User1")
				So(result[0].Group, ShouldEqual, "test1")
				So(result[0].Namespace, ShouldEqual, "n1")
			})
		})
		Convey("Subject: Edit UserSetting", func() {
			lab := `
		  	{
				"ID": 3,
				"Username": "User33",
				"AuthType": "Database",
				"Password": "User33",
				"Group": "test33",
				"Namespace": "n33"
		  	}`
			response = proxy.Put("/admin/users", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/users")
			Convey("Response should include one results", func() {
				var result []*models.User
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 3)
				So(result[2].ID, ShouldEqual, 3)
				So(result[2].Username, ShouldEqual, "User33")
				So(result[2].AuthType, ShouldEqual, "Database")
				So(result[2].Password, ShouldEqual, "User33")
				So(result[2].Group, ShouldEqual, "test33")
				So(result[2].Namespace, ShouldEqual, "n33")
			})
		})
	})
}
