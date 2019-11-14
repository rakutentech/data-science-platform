package test

import (
	"fmt"
	"os"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/astaxie/beego/logs"
	"github.com/astaxie/beego/orm"
)

func CleanTestTempFiles() {
	config := app.NewConfig()
	deleteOldDB(config)
	logs.Info("Clean test data path %s/template", app.GetConfig().DataPath)
	os.RemoveAll(fmt.Sprintf("%s/template", app.GetConfig().DataPath))
}

func InitTestDB() {
	config := app.NewConfig()
	deleteOldDB(config)
	resetDatabase(config)
	insertDummyData()
}

func FindUser(username string) (user models.User) {
	manager := models.NewModelManager(models.User{})
	manager.FindInstanceByName(username, &user)
	return
}

func resetDatabase(config *app.AppConfig) {
	orm.ResetModelCache()
	factory := models.NewDBFactory(config)
	factory.Init()
}

func deleteOldDB(config *app.AppConfig) {
	// detect if file exists
	if config.DB.DBType == models.DbSQLite {
		var _, err = os.Stat(config.DB.Sqlite.Path)
		if !os.IsNotExist(err) {
			var err = os.Remove(config.DB.Sqlite.Path)
			if err == nil {
				fmt.Println(fmt.Sprintf("Remove test db %s:", config.DB.Sqlite.Path))
			}
		}
	}
}

func insertDummyData() {
	createTestUsers()
	createTestLabSettings()
	createTestFunctionSettings()
	createInstanceTypes()
	createTestStorage()
}

func createTestLabSettings() {
	manager := models.NewModelManager(models.LabSetting{})
	setting := &models.LabSetting{
		Name:         "Jupyter",
		Group:        "group1",
		Description:  "desc1",
		LoadBalancer: "http://lb1",
		Public:       true,
		TemplatePath: app.GetConfig().DataPath,
	}
	template := models.NewTemplateHandlerManager(setting)
	template.SaveKubeDeploymentTemplate(
		&models.KubeDeploymentTemplate{
			DeploymentTemplate: "DeploymentTemplate",
			ServiceTemplate:    "ServiceTemplate",
			IngressTemplate:    "IngressTemplate",
		},
	)
	permission := models.NewPermissionHandlerManager(setting)
	permission.SavePermissionRoles(&models.PermissionRoles{
		AccessibleUsers:  []string{"user1", "user2"},
		AccessibleGroups: []string{"group1"},
	})
	manager.Create(setting)
}

func createTestFunctionSettings() {
	manager := models.NewModelManager(models.LabSetting{})
	setting := &models.FunctionSetting{
		Name:            "myfunc",
		Description:     "desc1",
		LoadBalancer:    "http://lb1",
		ProgramLanguage: "python",
		Trigger:         models.HTTPTrigger,
		Public:          true,
		TemplatePath:    app.GetConfig().DataPath,
	}
	template := models.NewTemplateHandlerManager(setting)
	template.SaveDefaultContextTemplate(
		&models.DefaultContextTemplate{
			DefaultFunction:    "print(123)",
			DefaultRequirement: "requests",
		},
	)
	template.SaveKubeDeploymentTemplate(
		&models.KubeDeploymentTemplate{
			DeploymentTemplate: "DeploymentTemplate",
			ServiceTemplate:    "ServiceTemplate",
			IngressTemplate:    "IngressTemplate",
		},
	)
	permission := models.NewPermissionHandlerManager(setting)
	permission.SavePermissionRoles(&models.PermissionRoles{
		AccessibleUsers:  []string{"user1", "user2"},
		AccessibleGroups: []string{"group1"},
	})
	manager.Create(setting)
	setting = &models.FunctionSetting{
		Name:            "myjob",
		Description:     "desc2",
		ProgramLanguage: "sh",
		Trigger:         models.EventTrigger,
		Public:          true,
		TemplatePath:    app.GetConfig().DataPath,
	}
	template = models.NewTemplateHandlerManager(setting)
	template.SaveDefaultContextTemplate(
		&models.DefaultContextTemplate{
			DefaultFunction:    "echo 123",
			DefaultRequirement: "#init",
		},
	)
	template.SaveKubeJobTemplate(
		&models.KubeJobTemplate{
			JobTemplate: "JobTemplate",
		},
	)
	permission = models.NewPermissionHandlerManager(setting)
	permission.SavePermissionRoles(&models.PermissionRoles{
		AccessibleUsers:  []string{"user3", "user4"},
		AccessibleGroups: []string{"group2"},
	})
	manager.Create(setting)
}

func createInstanceTypes() {
	manager := models.NewModelManager(models.InstanceType{})
	instanceType := &models.InstanceType{
		InstanceTypeSetting: models.InstanceTypeSetting{
			Name:        "type1",
			Description: "desc1",
			Group:       "Standard",
			CPU:         0.5,
			GPU:         0,
			Memory:      100,
			MemoryScale: "MiB",
			Public:      true,
		},
		TagsJSON: string(models.NewTagsHandlerManager(nil).ConvertTagsToJSON(models.Tags{
			"t1": "v1",
		})),
	}
	manager.Create(instanceType)
	instanceType = &models.InstanceType{
		InstanceTypeSetting: models.InstanceTypeSetting{
			Name:        "type2",
			Description: "desc2",
			Group:       "Standard",
			CPU:         10,
			GPU:         1,
			Memory:      200,
			MemoryScale: "GiB",
			Public:      false,
		},
		TagsJSON: string(models.NewTagsHandlerManager(nil).ConvertTagsToJSON(models.Tags{
			"t2": "v2",
			"t3": "v3",
		})),
	}
	permission := models.NewPermissionHandlerManager(instanceType)
	permission.SavePermissionRoles(&models.PermissionRoles{
		AccessibleUsers:  []string{"user1", "user2"},
		AccessibleGroups: []string{"group1"},
	})
	manager.Create(instanceType)
}

func createTestUsers() {
	manager := models.NewModelManager(models.User{})
	manager.Create(
		&models.User{
			Username:  "User1",
			AuthType:  "LDAP",
			Password:  "User1",
			Group:     "test1",
			Namespace: "n1",
		},
	)
	manager.Create(
		&models.User{
			Username:  "User2",
			AuthType:  "Database",
			Password:  "User2",
			Group:     "test2",
			Namespace: "n2",
		},
	)
	manager.Create(
		&models.User{
			Username:  "User3",
			AuthType:  "Database",
			Password:  "User3",
			Group:     "test3",
			Namespace: "n3",
		},
	)
}

func createTestStorage() {
	manager := models.NewModelManager(models.Storage{})
	manager.Create(
		&models.Storage{
			Label: "1 GB",
			Value: 1,
		},
	)
}

func ClearUserData() {
	// Clear old data
	manager := models.NewModelManager(models.LabSetting{})
	manager.DeleteWhere("lab_setting", "1=1")
	manager = models.NewModelManager(models.InstanceType{})
	manager.DeleteWhere("instance_type", "1=1")
	manager = models.NewModelManager(models.FunctionSetting{})
	manager.DeleteWhere("function_setting", "1=1")
	manager = models.NewModelManager(models.FunctionInstance{})
	manager.DeleteWhere("function_instance", "1=1")
	manager = models.NewModelManager(models.LabInstance{})
	manager.DeleteWhere("lab_instance", "1=1")
}

func InitTestAppLabSetting() {

	proxy := RequestProxy{
		Username:   "admin",
		Password:   "admin",
		RememberMe: true,
	}
	proxy.Login("/admin/auth")
	data := `
	{
		"Name": "lab1",
		"Description": "test Lab",
		"LoadBalancer": "dummy",
		"Group": "Lab",
		"DeploymentTemplate": "dd",
		"ServiceTemplate": "ss",
		"IngressTemplate": "ii",
		"Public": false,
		"AccessibleUsers": [
		  "user-a"
		],
		"AccessibleGroups": [
		  "group-a"
		]
	  }`
	proxy.Post("/admin/datalab", []byte(data))
	data = `
	{
		"Name": "lab2",
		"Description": "test Lab2",
		"LoadBalancer": "dummy2",
		"Group": "Lab",
		"DeploymentTemplate": "dd2",
		"ServiceTemplate": "ss2",
		"IngressTemplate": "ii2",
		"Public": true,
		"AccessibleUsers": [
		],
		"AccessibleGroups": [
		]
	  }`
	proxy.Post("/admin/datalab", []byte(data))
	data = `
	{
		"Name": "lab3",
		"Description": "test Lab3",
		"LoadBalancer": "dummy3",
		"Group": "Lab",
		"DeploymentTemplate": "dd3",
		"ServiceTemplate": "ss3",
		"IngressTemplate": "ii3",
		"Public": false,
		"AccessibleUsers": [
			"User2"
		],
		"AccessibleGroups": [
		]
	  }`
	proxy.Post("/admin/datalab", []byte(data))
	data = `
	{
		"Name": "lab4",
		"Description": "test Lab4",
		"LoadBalancer": "dummy4",
		"Group": "Lab",
		"DeploymentTemplate": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: {{.UUID}}\n  namespace: {{.Namespace}}\nlabels:\n    app: nginx\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: nginx\n  template:\n    metadata:\n      labels:\n        app: nginx\n    spec:\n      containers:\n      - name: nginx\n        image: nginx:1.7.9\n        ports:\n        - containerPort: 80",
		"ServiceTemplate": "ss4",
		"IngressTemplate": "ii4",
		"Public": false,
		"AccessibleUsers": [
		],
		"AccessibleGroups": [
			"test2"
		]
	  }`
	proxy.Post("/admin/datalab", []byte(data))
}

func InitTestAppInstanceType() {

	proxy := RequestProxy{
		Username:   "admin",
		Password:   "admin",
		RememberMe: true,
	}
	proxy.Login("/admin/auth")
	data := `
			{
				"Name": "t1",
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
	proxy.Post("/admin/instancetypes", []byte(data))
	data = `
	{
		"Name": "t2",
		"Description": "2 cpu X 512 GiB",
		"Group": "Standard",
		"CPU": 2,
		"GPU": 2,
		"Memory": 256,
		"MemoryScale": "MiB",
		"Public": true,
		"AccessibleUsers": [],
		"AccessibleGroups": [],
		"Tags": {
			"env": "stg",
			"app": "fronent"
		}
	  }`
	proxy.Post("/admin/instancetypes", []byte(data))
	data = `
	{
		"Name": "t3",
		"Description": "1.5 cpu X 128 GiB",
		"Group": "Standard",
		"CPU": 1.5,
		"GPU": 1,
		"Memory": 128,
		"MemoryScale": "GiB",
		"Public": false,
		"AccessibleUsers": ["User2"],
		"AccessibleGroups": [],
		"Tags": {
			"env": "stg",
			"app": "fronent"
		}
	  }`
	proxy.Post("/admin/instancetypes", []byte(data))
}

func InitTestAppFunctionSetting() {

	proxy := RequestProxy{
		Username:   "admin",
		Password:   "admin",
		RememberMe: true,
	}
	proxy.Login("/admin/auth")
	data := `
	{
		"Name": "MyFun1",
		"Description": "test func",
		"ProgramLanguage": "python",
		"Trigger":"http",
		"LoadBalancer": "dummy",
		"DefaultFunction":"hello world",
		"DefaultRequirement":"###",
		"DeploymentTemplate":"dd",
		"ServiceTemplate":"ss",
		"IngressTemplate":"ii",
		"Public": false,
		"AccessibleUsers": [
		  "user-a"
		],
		"AccessibleGroups": [
		  "group-b"
		]
	}`
	proxy.Post("/admin/function", []byte(data))
	data = `
	{
		"Name": "MyFun2",
		"Description": "test func2",
		"ProgramLanguage": "python",
		"Trigger":"http",
		"LoadBalancer": "dummy2",
		"DefaultFunction":"func2",
		"DefaultRequirement":"req2",
		"DeploymentTemplate":"dd2",
		"ServiceTemplate":"ss2",
		"IngressTemplate":"ii2",
		"Public": true,
		"AccessibleUsers": [
		],
		"AccessibleGroups": [
		]
	}`
	proxy.Post("/admin/function", []byte(data))
	data = `
	{
		"Name": "MyFun3",
		"Description": "test func3",
		"ProgramLanguage": "python",
		"Trigger":"http",
		"LoadBalancer": "dummy3",
		"DefaultFunction":"func3",
		"DefaultRequirement":"req3",
		"DeploymentTemplate":"dd3",
		"ServiceTemplate":"ss3",
		"IngressTemplate":"ii3",
		"Public": false,
		"AccessibleUsers": [
			"User2"
		],
		"AccessibleGroups": [
		]
	}`
	proxy.Post("/admin/function", []byte(data))
	data = `
	{
		"Name": "MyFun4",
		"Description": "test func4",
		"ProgramLanguage": "python",
		"Trigger":"http",
		"LoadBalancer": "dummy4",
		"DefaultFunction":"func4",
		"DefaultRequirement":"req4",
		"DeploymentTemplate":"dd4",
		"ServiceTemplate":"ss4",
		"IngressTemplate":"ii4",
		"Public": false,
		"AccessibleUsers": [
		],
		"AccessibleGroups": [
			"test2"
		]
	}`
	proxy.Post("/admin/function", []byte(data))
}
