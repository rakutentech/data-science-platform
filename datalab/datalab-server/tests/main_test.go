package test

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"testing"

	"github.com/astaxie/beego"
)

func init() {
	_, file, _, _ := runtime.Caller(1)
	apppath, _ := filepath.Abs(filepath.Dir(filepath.Join(file, ".."+string(filepath.Separator))))
	beego.TestBeegoInit(apppath)
	InitTestDB()
}

func TestMain(m *testing.M) {
	fmt.Println("Before all...")

	code := m.Run()

	CleanTestTempFiles()
	fmt.Println("After all...")

	os.Exit(code)
}
