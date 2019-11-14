package test

import (
	"encoding/json"
	"fmt"
	"testing"

	app "github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/app"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/routers"
	"github.com/astaxie/beego"
	. "github.com/smartystreets/goconvey/convey"
)

func TestUserLabInstanceAPI(t *testing.T) {

	ClearUserData()
	InitTestAppLabSetting()
	InitTestAppInstanceType()
	proxy := RequestProxy{
		Username:   "User2",
		Password:   "User2",
		RememberMe: true,
	}

	beego.Trace("testing", "TestUserLabInstanceAPI")

	loginStatus := proxy.Login("/auth")

	Convey("Subject: Test TestUserLabInstanceAPI Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})

		Convey("Subject: Test Create lab instance", func() {
			data := `
		{
		   "TypeName": "lab3",
		   "TypeGroup": "Lab",
	       "Name": "mylab1",             
	       "InstanceTypeName": "t3",
	       "EphemeralStorage": 100,
	       "Tags": {
	       	"env": "stg"
	       }
		}
		`
			response := proxy.Post("/datalab/instances", []byte(data))
			So(response.Code, ShouldEqual, 200)
			data = `
			{
			   "TypeName": "lab4",
			   "TypeGroup": "Lab",
			   "Name": "mylab2",             
			   "InstanceTypeName": "t3",
			   "EphemeralStorage": 100,
			   "Tags": {
				   "env": "stg"
			   }
			}
			`
			response = proxy.Post("/datalab/instances", []byte(data))
			So(response.Code, ShouldEqual, 200)
			data = `
		{
		   "TypeName": "jupyter",
		   "TypeGroup": "Lab",
	       "Name": "mylab3",             
	       "InstanceTypeName": "small",
	       "EphemeralStorage": 100,
	       "Tags": {
	       	"env": "stg"
	       }
		}
		`
			response = proxy.Post("/datalab/instances", []byte(data))
			So(response.Code, ShouldEqual, 403)
			data = `
		{
		   "TypeName": "lab1",
		   "TypeGroup": "Lab",
	       "Name": "mylab4",             
	       "InstanceTypeName": "t3",
	       "EphemeralStorage": 100,
	       "Tags": {
	       	"env": "stg"
	       }
		}
		`
			response = proxy.Post("/datalab/instances", []byte(data))
			So(response.Code, ShouldEqual, 403)
			data = `
		{
		   "TypeName": "lab3",
		   "TypeGroup": "Lab",
	       "Name": "mylab5",             
	       "InstanceTypeName": "t1",
	       "EphemeralStorage": 100,
	       "Tags": {
	       	"env": "stg"
	       }
		}
		`
			response = proxy.Post("/datalab/instances", []byte(data))
			So(response.Code, ShouldEqual, 403)

		})

		Convey("Subject: Read lab instance", func() {
			response := proxy.Get("/datalab/instances")
			So(response.Code, ShouldEqual, 200)
			var result []*app.LabInstanceJSON
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 2)
			So(result[0].TypeName, ShouldEqual, "lab3")
			So(result[0].TypeGroup, ShouldEqual, "Lab")
			So(result[0].Name, ShouldEqual, "mylab1")
			So(result[0].InstanceTypeName, ShouldEqual, "t3")
			So(result[0].EphemeralStorage, ShouldEqual, 100)
			So(result[0].StorageScale, ShouldEqual, "GiB")
			So(result[0].Owner, ShouldEqual, "User2")
			So(result[0].Namespace, ShouldEqual, "n2")
			So((*result[0].Tags)["env"], ShouldEqual, "stg")
		})
		Convey("Subject: Read lab instance detail and delete it", func() {
			response := proxy.Get("/datalab/instances/Lab/lab4/mylab2")
			So(response.Code, ShouldEqual, 200)
			var result app.LabInstanceJSON
			json.Unmarshal(response.Body.Bytes(), &result)
			So(result.TypeName, ShouldEqual, "lab4")
			So(result.TypeGroup, ShouldEqual, "Lab")
			So(result.Name, ShouldEqual, "mylab2")
			So(result.InstanceTypeName, ShouldEqual, "t3")
			So(result.EphemeralStorage, ShouldEqual, 100)
			So(result.StorageScale, ShouldEqual, "GiB")
			So(result.Owner, ShouldEqual, "User2")
			So(result.Namespace, ShouldEqual, "n2")
			So((*result.Tags)["env"], ShouldEqual, "stg")
			data := fmt.Sprintf(`
			{
			   "ID": %d
			}`, result.ID)
			response = proxy.Delete("/datalab/instances", []byte(data))
			So(response.Code, ShouldEqual, 200)
			response = proxy.Get("/datalab/instances")
			So(response.Code, ShouldEqual, 200)
			var instances []*app.LabInstanceJSON
			json.Unmarshal(response.Body.Bytes(), &instances)
			So(len(instances), ShouldEqual, 1)
		})
		Convey("Subject: Read lab instance log", func() {
			response := proxy.Get("/datalab/instances/Lab/lab3/mylab1/log")
			So(response.Code, ShouldEqual, 200)
			response = proxy.Get("/datalab/instances/Lab/lab4/mylab2/log")
			So(response.Code, ShouldEqual, 400)
		})
	})
}
