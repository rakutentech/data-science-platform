package logs

import (
	"fmt"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
	"github.com/astaxie/beego/logs"
)

var log *logs.BeeLogger

func init() {
	logs.EnableFuncCallDepth(true)

	// Set log level
	switch app.GetConfig().Log.LogLevel {
	case "info":
		logs.SetLevel(logs.LevelInfo)
	case "error":
		logs.SetLevel(logs.LevelError)
	case "debug":
		fallthrough
	default:
		logs.SetLevel(logs.LevelDebug)
	}

	// Set log type
	if app.GetConfig().Log.LogType == "file" {
		logs.SetLogger(app.GetConfig().Log.LogType, fmt.Sprintf(`{"filename":"%s"}`, app.GetConfig().Log.LogPath))
	} else {
		//By default, log type is console
		logs.SetLogger(app.GetConfig().Log.LogType, "")
	}
}
