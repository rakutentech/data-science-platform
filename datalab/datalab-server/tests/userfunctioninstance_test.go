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

func TestUserFunctionInstanceAPI(t *testing.T) {

	ClearUserData()
	InitTestAppFunctionSetting()
	InitTestAppInstanceType()
	proxy := RequestProxy{
		Username:   "User2",
		Password:   "User2",
		RememberMe: true,
	}

	beego.Trace("testing", "TestUserFunctionInstanceAPI")

	loginStatus := proxy.Login("/auth")

	Convey("Subject: Test TestUserFunctionInstanceAPI Endpoint\n", t, func() {
		Convey("Login status should be true", func() {
			So(loginStatus, ShouldEqual, true)
		})

		Convey("Subject: Test Create function instance", func() {
			data := `
		{
	       "FunctionName": "MyFun2",
	       "Name": "myfunc1",             
	       "InstanceTypeName": "t3",
		   "Trigger": "http",
		   "InstanceNumber": 1,
		   "IngressPath": "/",
		   "FunctionContextType": "inline",
		   "FunctionContext": {
			 "Code":          "Code",
			 "Requirement":   "Requirement"
		   },
	       "Tags": {
	       	"env": "stg"
	       }
		}
		`
			response := proxy.Post("/function/instances", []byte(data))
			So(response.Code, ShouldEqual, 200)

			data = `
			{
				"FunctionName": "MyFun2",
				"Name": "myfunc2",             
				"InstanceTypeName": "t3",
				"Trigger": "event",
				"FunctionContextType": "git",
				"FunctionContext": {
				  "GitRepo":       "git://myrepo",
				  "GitBranch":     "master",
				  "GitEntrypoint": "entrypoint.sh"
				},
				"Tags": {
					"env": "stg"
				}
			 }		`
			response = proxy.Post("/function/instances", []byte(data))
			So(response.Code, ShouldEqual, 200)

			data = `
			{
				"FunctionName": "MyFun2",
				"Name": "myfunc3",             
				"InstanceTypeName": "t3",
				"Trigger": "event",
				"FunctionContextType": "zip",
				"FunctionContext": {
				  "ZipFileData":   "abcd",
				  "ZipFileName":   "m.zip",
				  "ZipEntrypoint": "entrypoint.sh"
				},
				"Tags": {
					"env": "stg"
				}
			 }		`
			response = proxy.Post("/function/instances", []byte(data))
			So(response.Code, ShouldEqual, 200)
			data = `
			{
				"FunctionName": "MyFun1",
				"Name": "myfunc4",             
				"InstanceTypeName": "t3",
				"Trigger": "http",
				"InstanceNumber": 1,
				"IngressPath": "/abc",
				"FunctionContextType": "inline",
				"FunctionContext": {
				  "Code":          "Code",
				  "Requirement":   "Requirement",
				  "GitRepo":       "",
				  "GitBranch":     "",
				  "GitEntrypoint": "",
				  "ZipFileData":   "",
				  "ZipFileName":   "",
				  "ZipEntrypoint": ""
				},
				"Tags": {
					"env": "stg"
				}
			 }
					`
			response = proxy.Post("/function/instances", []byte(data))
			So(response.Code, ShouldEqual, 403)
			data = `
			{
				"FunctionName": "MyFun2",
				"Name": "myfunc5",             
				"InstanceTypeName": "t1",
				"Trigger": "http",
				"InstanceNumber": 1,
				"IngressPath": "/def",
				"FunctionContextType": "inline",
				"FunctionContext": {
				  "Code":          "Code",
				  "Requirement":   "Requirement",
				  "GitRepo":       "",
				  "GitBranch":     "",
				  "GitEntrypoint": "",
				  "ZipFileData":   "",
				  "ZipFileName":   "",
				  "ZipEntrypoint": ""
				},
				"Tags": {
					"env": "stg"
				}
			 }
					`
			response = proxy.Post("/function/instances", []byte(data))
			So(response.Code, ShouldEqual, 403)
			data = `
			{
				"FunctionName": "MyFun2",
				"Name": "myfunc6",             
				"InstanceTypeName": "t1",
				"Trigger": "http",
				"InstanceNumber": 1,
				"IngressPath": "/",
				"FunctionContextType": "inline",
				"FunctionContext": {
				  "Code":          "Code",
				  "Requirement":   "Requirement",
				  "GitRepo":       "",
				  "GitBranch":     "",
				  "GitEntrypoint": "",
				  "ZipFileData":   "",
				  "ZipFileName":   "",
				  "ZipEntrypoint": ""
				},
				"Tags": {
					"env": "stg"
				}
			 }
					`
			response = proxy.Post("/function/instances", []byte(data))
			So(response.Code, ShouldEqual, 400)

			data = `
			{
				"FunctionName": "MyFun2",
				"Name": "myfunc7",             
				"InstanceTypeName": "t3",
				"Trigger": "event",
				"FunctionContextType": "unknown",
				"FunctionContext": {
				  "GitRepo":       "git://myrepo",
				  "GitBranch":     "master",
				  "GitEntrypoint": "entrypoint.sh"
				},
				"Tags": {
					"env": "stg"
				}
			 }		`
			response = proxy.Post("/function/instances", []byte(data))
			So(response.Code, ShouldEqual, 400)

			data = `
			{
				"FunctionName": "MyFun2",
				"Name": "myfunc8",             
				"InstanceTypeName": "t3",
				"Trigger": "unknown",
				"FunctionContextType": "git",
				"FunctionContext": {
				  "GitRepo":       "git://myrepo",
				  "GitBranch":     "master",
				  "GitEntrypoint": "entrypoint.sh"
				},
				"Tags": {
					"env": "stg"
				}
			 }		`
			response = proxy.Post("/function/instances", []byte(data))
			So(response.Code, ShouldEqual, 400)

		})

		Convey("Subject: Read function instance", func() {
			response := proxy.Get("/function/instances")
			So(response.Code, ShouldEqual, 200)
			var result []*app.FunctionInstanceJSON
			json.Unmarshal(response.Body.Bytes(), &result)
			So(len(result), ShouldEqual, 3)
			So(result[0].FunctionName, ShouldEqual, "MyFun2")
			So(result[0].Name, ShouldEqual, "myfunc1")
			So(result[0].Trigger, ShouldEqual, "http")
			So(result[0].InstanceTypeName, ShouldEqual, "t3")
			So(result[0].EphemeralStorage, ShouldEqual, 0)
			So(result[0].StorageScale, ShouldEqual, "")
			So(result[0].Owner, ShouldEqual, "User2")
			So(result[0].Namespace, ShouldEqual, "n2")
			So(result[0].IngressPath, ShouldEqual, "/")
			So(result[0].InstanceNumber, ShouldEqual, 1)
			So(result[0].FunctionContextType, ShouldEqual, "inline")
			So(result[0].FunctionContext.Code, ShouldEqual, "Code")
			So(result[0].FunctionContext.Requirement, ShouldEqual, "Requirement")
			So((*result[0].Tags)["env"], ShouldEqual, "stg")
			So(result[1].FunctionName, ShouldEqual, "MyFun2")
			So(result[1].Name, ShouldEqual, "myfunc2")
			So(result[1].Trigger, ShouldEqual, "event")
			So(result[1].InstanceTypeName, ShouldEqual, "t3")
			So(result[1].EphemeralStorage, ShouldEqual, 0)
			So(result[1].StorageScale, ShouldEqual, "")
			So(result[1].Owner, ShouldEqual, "User2")
			So(result[1].Namespace, ShouldEqual, "n2")
			So(result[1].IngressPath, ShouldEqual, "")
			So(result[1].InstanceNumber, ShouldEqual, 0)
			So(result[1].FunctionContextType, ShouldEqual, "git")
			So(result[1].FunctionContext.GitRepo, ShouldEqual, "git://myrepo")
			So(result[1].FunctionContext.GitBranch, ShouldEqual, "master")
			So(result[1].FunctionContext.GitEntrypoint, ShouldEqual, "entrypoint.sh")
			So((*result[1].Tags)["env"], ShouldEqual, "stg")
			So(result[2].FunctionName, ShouldEqual, "MyFun2")
			So(result[2].Name, ShouldEqual, "myfunc3")
			So(result[2].Trigger, ShouldEqual, "event")
			So(result[2].InstanceTypeName, ShouldEqual, "t3")
			So(result[2].EphemeralStorage, ShouldEqual, 0)
			So(result[2].StorageScale, ShouldEqual, "")
			So(result[2].Owner, ShouldEqual, "User2")
			So(result[2].Namespace, ShouldEqual, "n2")
			So(result[2].IngressPath, ShouldEqual, "")
			So(result[2].InstanceNumber, ShouldEqual, 0)
			So(result[2].FunctionContextType, ShouldEqual, "zip")
			So(result[2].FunctionContext.ZipFileName, ShouldEqual, "m.zip")
			So(result[2].FunctionContext.ZipFileData, ShouldEqual, "abcd")
			So(result[2].FunctionContext.ZipEntrypoint, ShouldEqual, "entrypoint.sh")
			So((*result[2].Tags)["env"], ShouldEqual, "stg")
		})
		Convey("Subject: Read function instance detail and update/delete it", func() {
			response := proxy.Get("/function/instances/http/myfunc1")
			So(response.Code, ShouldEqual, 200)
			var result app.FunctionInstanceJSON
			json.Unmarshal(response.Body.Bytes(), &result)
			So(result.FunctionName, ShouldEqual, "MyFun2")
			So(result.Name, ShouldEqual, "myfunc1")
			So(result.Trigger, ShouldEqual, "http")
			So(result.InstanceTypeName, ShouldEqual, "t3")
			So(result.EphemeralStorage, ShouldEqual, 0)
			So(result.StorageScale, ShouldEqual, "")
			So(result.Owner, ShouldEqual, "User2")
			So(result.Namespace, ShouldEqual, "n2")
			So(result.IngressPath, ShouldEqual, "/")
			So(result.InstanceNumber, ShouldEqual, 1)
			So(result.FunctionContextType, ShouldEqual, "inline")
			So(result.FunctionContext.Code, ShouldEqual, "Code")
			So(result.FunctionContext.Requirement, ShouldEqual, "Requirement")
			data := fmt.Sprintf(`
			{
			   "ID": %d,
			   "InstanceNumber": 2,
			   "FunctionContext": {
				"Code":          "Code2",
				"Requirement":   "Requirement2"
			  }
			}`, result.ID)
			response = proxy.Put("/function/instances", []byte(data))
			So(response.Code, ShouldEqual, 400) // fake backend cannot support k8s updated

			response = proxy.Get("/function/instances/http/myfunc1")
			So(response.Code, ShouldEqual, 200)
			json.Unmarshal(response.Body.Bytes(), &result)
			So(result.FunctionName, ShouldEqual, "MyFun2")
			So(result.Name, ShouldEqual, "myfunc1")
			So(result.Trigger, ShouldEqual, "http")
			So(result.InstanceTypeName, ShouldEqual, "t3")
			So(result.EphemeralStorage, ShouldEqual, 0)
			So(result.StorageScale, ShouldEqual, "")
			So(result.Owner, ShouldEqual, "User2")
			So(result.Namespace, ShouldEqual, "n2")
			So(result.IngressPath, ShouldEqual, "/")
			So(result.InstanceNumber, ShouldEqual, 2)
			So(result.FunctionContextType, ShouldEqual, "inline")
			So(result.FunctionContext.Code, ShouldEqual, "Code2")
			So(result.FunctionContext.Requirement, ShouldEqual, "Requirement2")

			data = fmt.Sprintf(`
				{
				   "ID": %d
				}`, result.ID)
			response = proxy.Delete("/function/instances", []byte(data))
			So(response.Code, ShouldEqual, 200)
			response = proxy.Get("/function/instances")
			So(response.Code, ShouldEqual, 200)
			var instances []*app.LabInstanceJSON
			json.Unmarshal(response.Body.Bytes(), &instances)
			So(len(instances), ShouldEqual, 2)
		})
		Convey("Subject: Read function instance log", func() {
			response := proxy.Get("/function/instances/event/myfunc2/log")
			So(response.Code, ShouldEqual, 200)
			response = proxy.Get("/function/instances/http/myfunc1/log")
			So(response.Code, ShouldEqual, 400)
		})
	})
}
