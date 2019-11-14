package kubernetes

import (
	"bytes"
	"text/template"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
)

type KubeTemplateParser struct{}

func (*KubeTemplateParser) Parse(context string, variables interface{}) string {
	t := template.Must(template.New("KubeTemplateParser").Parse(context))
	buf := bytes.NewBufferString("")
	t.Execute(buf, variables)
	return buf.String()
}

type TemplateVariables struct {
	UUID             string
	Username         string
	UserGroup        string
	UserToken        string
	Namespace        string
	LoadBalancer     string
	InstanceName     string
	InstanceNumber   int
	InstanceType     string
	CPU              string
	GPU              string
	Memory           string
	EphemeralStorage string
	IngressPath      string
	FunctionContext  string
	JobID            string
	InstanceTags     models.Tags
	InstanceTypeTags models.Tags
}
