package models

import (
	"fmt"
	"io/ioutil"
	"os"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/utils"
	"github.com/astaxie/beego/logs"
)

type TemplateHandlerManager struct {
	handler TemplatePathHandler
}

func NewTemplateHandlerManager(handler TemplatePathHandler) *TemplateHandlerManager {
	return &TemplateHandlerManager{
		handler: handler,
	}
}

func (c *TemplateHandlerManager) saveContext(name, context string) (err error) {
	logs.Info(fmt.Sprintf("Save template [%s] to %s", name, c.handler.GetTemplatePath()))
	err = os.MkdirAll(c.handler.GetTemplatePath(), os.ModePerm)
	if err != nil {
		return err
	}
	contextPath := fmt.Sprintf("%s/%s", c.handler.GetTemplatePath(), name)
	if err = utils.ApplyFile([]byte(context), contextPath); err != nil {
		return err
	}
	return
}

func (c *TemplateHandlerManager) SaveKubeDeploymentTemplate(kube *KubeDeploymentTemplate) (err error) {
	err = c.saveContext(DeploymentTemplateName, kube.DeploymentTemplate)
	if err != nil {
		return err
	}
	err = c.saveContext(ServiceTemplateName, kube.ServiceTemplate)
	if err != nil {
		return err
	}
	err = c.saveContext(IngressTemplateName, kube.IngressTemplate)
	return err
}

func (c *TemplateHandlerManager) SaveKubeJobTemplate(kube *KubeJobTemplate) (err error) {
	return c.saveContext(JobTemplateName, kube.JobTemplate)
}

func (c *TemplateHandlerManager) SaveDefaultContextTemplate(context *DefaultContextTemplate) (err error) {
	err = c.saveContext(DefaultFunctionTemplateName, context.DefaultFunction)
	if err != nil {
		return err
	}
	err = c.saveContext(DefaultRequirementTemplateName, context.DefaultRequirement)
	return err
}

func (c *TemplateHandlerManager) readContext(name string) string {
	contextPath := fmt.Sprintf("%s/%s", c.handler.GetTemplatePath(), name)
	context, err := ioutil.ReadFile(contextPath)
	if err == nil {
		return string(context)
	} else {
		logs.Error(err.Error())
		return ""
	}
}

func (c *TemplateHandlerManager) GetKubeDeploymentTemplate() *KubeDeploymentTemplate {
	return &KubeDeploymentTemplate{
		DeploymentTemplate: c.readContext(DeploymentTemplateName),
		ServiceTemplate:    c.readContext(ServiceTemplateName),
		IngressTemplate:    c.readContext(IngressTemplateName),
	}
}

func (c *TemplateHandlerManager) GetKubeJobTemplate() *KubeJobTemplate {
	return &KubeJobTemplate{
		JobTemplate: c.readContext(JobTemplateName),
	}
}

func (c *TemplateHandlerManager) GetDefaultContextTemplate() *DefaultContextTemplate {
	return &DefaultContextTemplate{
		DefaultFunction:    c.readContext(DefaultFunctionTemplateName),
		DefaultRequirement: c.readContext(DefaultRequirementTemplateName),
	}
}

func (c *TemplateHandlerManager) DeleteTemplate() (err error) {
	logs.Info(fmt.Sprintf("Delete template on %s", c.handler.GetTemplatePath()))
	return os.RemoveAll(c.handler.GetTemplatePath())
}
