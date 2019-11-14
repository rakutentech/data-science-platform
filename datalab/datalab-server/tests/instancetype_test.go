package test

import (
	"encoding/json"
	"testing"

	admin "github.com/rakutentech/data-science-platform/datalab/datalab-server/controllers/admin"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/routers"

	"github.com/astaxie/beego"
	. "github.com/smartystreets/goconvey/convey"
)

// GetDataLab is a sample to run an endpoint test
func TestInstanceTypeAPI(t *testing.T) {

	proxy := RequestProxy{
		Username:   "admin",
		Password:   "admin",
		RememberMe: true,
	}

	beego.Trace("testing", "TestInstanceTypeAPI")

	loginStatus := proxy.Login("/admin/auth")

	Convey("Subject: Test InstanceType Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})
		response := proxy.Get("/admin/instancetypes")
		Convey("Response should include one result", func() {
			So(response.Code, ShouldEqual, 200)
			var result []*admin.InstanceTypeJSON
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 2)
			So(result[0].ID, ShouldEqual, 1)
			So(result[0].Name, ShouldEqual, "type1")
			So(result[0].Group, ShouldEqual, "Standard")
			So(result[0].CPU, ShouldEqual, 0.5)
			So(result[0].Memory, ShouldEqual, 100)
			So(len(result[0].AccessibleUsers), ShouldEqual, 0)
			So(map[string]string(*result[0].Tags)["t1"], ShouldEqual, "v1")
			So(result[1].ID, ShouldEqual, 2)
			So(result[1].Name, ShouldEqual, "type2")
			So(result[1].Group, ShouldEqual, "Standard")
			So(result[1].CPU, ShouldEqual, 10)
			So(result[1].Memory, ShouldEqual, 200)
			So(result[1].AccessibleUsers[0], ShouldEqual, "user1")
			So(map[string]string(*result[1].Tags)["t2"], ShouldEqual, "v2")
		})
		Convey("Subject: Create New InstanceType", func() {
			data := `
			{
				"Name": "type3",
				"Description": "1.5 cpu X 512 GiB",
				"Group": "Standard",
				"CPU": 1.5,
				"GPU": 1,
				"Memory": 512,
				"MemoryScale": "GiB",
				"Public": false,
				"AccessibleUsers": ["user3"],
				"AccessibleGroups": [],
				"Tags": {
					"env": "stg",
					"app": "fronent"
				}
			  }`
			response = proxy.Post("/admin/instancetypes", []byte(data))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/instancetypes")
			Convey("Response should include three results", func() {
				var result []*admin.InstanceTypeJSON
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 3)
				So(result[2].ID, ShouldEqual, 3)
				So(result[2].Name, ShouldEqual, "type3")
				So(result[2].Group, ShouldEqual, "Standard")
				So(result[2].CPU, ShouldEqual, 1.5)
				So(result[2].GPU, ShouldEqual, 1)
				So(result[2].MemoryScale, ShouldEqual, "GiB")
				So(result[2].AccessibleUsers[0], ShouldEqual, "user3")
				So(map[string]string(*result[2].Tags)["env"], ShouldEqual, "stg")
			})
		})
		Convey("Subject: Delete InstanceType", func() {
			lab := `
			  {
				"ID": 1
			  }`
			response = proxy.Delete("/admin/instancetypes", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/instancetypes")
			Convey("Response should include two results", func() {
				var result []*admin.InstanceTypeJSON
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 2)
				So(result[0].ID, ShouldEqual, 2)
				So(result[0].Name, ShouldEqual, "type2")
				So(result[1].Name, ShouldEqual, "type3")
			})
		})
		Convey("Subject: Edit InstanceType", func() {
			lab := `
				  {
					   "ID": 3,
						 "Name": "type3",
						 "Description": "1.5 cpu X 512 GiB",
						 "Group": "Standard",
						 "CPU": 2,
						 "GPU": 1,
						 "Memory": 512,
						 "MemoryScale": "GiB",
						 "Public": false,
						 "AccessibleUsers": ["user-4"],
						 "AccessibleGroups": ["group-4"],
						 "Tags": {
							 "env": "prod",
							 "app": "fronent"
						 }
				  }`
			response = proxy.Put("/admin/instancetypes", []byte(lab))
			So(IsSuccessAction(response.Body.Bytes()), ShouldEqual, true)
			response := proxy.Get("/admin/instancetypes")
			Convey("Response should include two results", func() {
				var result []*admin.InstanceTypeJSON
				json.Unmarshal(response.Body.Bytes(), &result)
				So(len(result), ShouldEqual, 2)
				So(result[1].ID, ShouldEqual, 3)
				So(result[1].Name, ShouldEqual, "type3")
				So(result[1].Group, ShouldEqual, "Standard")
				So(result[1].CPU, ShouldEqual, 2)
				So(result[1].GPU, ShouldEqual, 1)
				So(result[1].MemoryScale, ShouldEqual, "GiB")
				So(result[1].AccessibleUsers[0], ShouldEqual, "user-4")
				So(result[1].AccessibleGroups[0], ShouldEqual, "group-4")
				So(map[string]string(*result[1].Tags)["env"], ShouldEqual, "prod")
			})
		})
	})
}
