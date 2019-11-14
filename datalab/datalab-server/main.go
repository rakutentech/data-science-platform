package main

import (
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/kubernetes"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/logs"
	_ "github.com/rakutentech/data-science-platform/datalab/datalab-server/routers"
	"github.com/astaxie/beego"
)

func main() {
	if beego.BConfig.RunMode == "dev" {
		beego.BConfig.WebConfig.DirectoryIndex = true
		beego.BConfig.WebConfig.StaticDir["/swagger"] = "swagger"
	}
	kubernetes.GetJobManager().Start()
	beego.Run()
}
