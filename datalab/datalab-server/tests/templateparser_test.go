package test

import (
	"testing"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/kubernetes"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	. "github.com/smartystreets/goconvey/convey"
)

// GetDataLab is a sample to run an endpoint test
func TestTemplateParser(t *testing.T) {

	templateParser := new(kubernetes.KubeTemplateParser)
	instanceTagsHandler := models.NewTagsHandlerManager(&models.LabInstance{})
	instanceTypeTagsHandler := models.NewTagsHandlerManager(&models.InstanceType{})
	templateVariable := kubernetes.TemplateVariables{
		UUID:             "UUID",
		Username:         "Username",
		UserGroup:        "UserGroup",
		UserToken:        "UserToken",
		Namespace:        "Namespace",
		LoadBalancer:     "LoadBalancer",
		InstanceNumber:   1,
		InstanceName:     "InstanceName",
		InstanceType:     "InstanceType",
		CPU:              "10m",
		GPU:              "1",
		Memory:           "10MiB",
		EphemeralStorage: "50MiB",
		IngressPath:      "/IngressPath",
		InstanceTags:     *instanceTagsHandler.GetTags(),
		InstanceTypeTags: *instanceTypeTagsHandler.GetTags(),
	}
	Convey("Subject: Test TemplateParser without tags\n", t, func() {
		So(templateParser.Parse("{{.UUID}}", templateVariable), ShouldEqual, "UUID")
		So(templateParser.Parse("{{.Username}}", templateVariable), ShouldEqual, "Username")
		So(templateParser.Parse("{{.UserGroup}}", templateVariable), ShouldEqual, "UserGroup")
		So(templateParser.Parse("{{.UserToken}}", templateVariable), ShouldEqual, "UserToken")
		So(templateParser.Parse("{{.Namespace}}", templateVariable), ShouldEqual, "Namespace")
		So(templateParser.Parse("{{.LoadBalancer}}", templateVariable), ShouldEqual, "LoadBalancer")
		So(templateParser.Parse("{{.InstanceNumber}}", templateVariable), ShouldEqual, "1")
		So(templateParser.Parse("{{.InstanceName}}", templateVariable), ShouldEqual, "InstanceName")
		So(templateParser.Parse("{{.InstanceType}}", templateVariable), ShouldEqual, "InstanceType")
		So(templateParser.Parse("{{.CPU}}", templateVariable), ShouldEqual, "10m")
		So(templateParser.Parse("{{.GPU}}", templateVariable), ShouldEqual, "1")
		So(templateParser.Parse("{{.Memory}}", templateVariable), ShouldEqual, "10MiB")
		So(templateParser.Parse("{{.EphemeralStorage}}", templateVariable), ShouldEqual, "50MiB")
		So(templateParser.Parse("{{.InstanceTags.tag}}", templateVariable), ShouldEqual, "<no value>")
		So(templateParser.Parse("{{.InstanceTypeTags.tag}}", templateVariable), ShouldEqual, "<no value>")
		So(templateParser.Parse("{{with .InstanceTypeTags.tag}}{{index .}}{{else}}none{{end}}", templateVariable),
			ShouldEqual, "none")
	})
	instanceTagsHandler = models.NewTagsHandlerManager(&models.LabInstance{
		TagsJSON: `{"tag":"val"}`,
	})
	instanceTypeTagsHandler = models.NewTagsHandlerManager(&models.InstanceType{
		TagsJSON: `{"tag":"val"}`,
	})
	templateVariable = kubernetes.TemplateVariables{
		InstanceTags:     *instanceTagsHandler.GetTags(),
		InstanceTypeTags: *instanceTypeTagsHandler.GetTags(),
	}
	Convey("Subject: Test TemplateParser with tags\n", t, func() {
		So(templateParser.Parse("{{.InstanceTags.tag}}", templateVariable), ShouldEqual, "val")
		So(templateParser.Parse("{{.InstanceTypeTags.tag}}", templateVariable), ShouldEqual, "val")
		So(templateParser.Parse(`{{with .InstanceTypeTags.tag}}{{index .}}{{else}}none{{end}}`, templateVariable),
			ShouldEqual, "val")
		So(templateParser.Parse(`{{with .InstanceTypeTags.tag2}}{{index .}}{{else}}none{{end}}`, templateVariable),
			ShouldEqual, "none")
	})
}
