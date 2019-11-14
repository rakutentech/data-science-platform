package models

import (
	"encoding/json"
)

type TriggerManager struct {
}

func (this *TriggerManager) NewTriggerManager(instance *FunctionInstance) TriggerContextBuilder {
	var handler TriggerContextBuilder
	switch instance.Trigger {
	case HTTPTrigger:
		handler = &HttpTriggerContextBuilder{
			instance: instance,
		}
	case EventTrigger:
		fallthrough
	default:
		handler = &EventTriggerContextBuilder{
			instance: instance,
		}
	}
	return handler
}

type TriggerContextBuilder interface {
	BuildEncodedJSONContext(context FunctionContext, input ...interface{}) string
}

type HttpTriggerContextBuilder struct {
	instance *FunctionInstance
}

func (c *HttpTriggerContextBuilder) BuildEncodedJSONContext(context FunctionContext, input ...interface{}) string {
	var jsonData []byte
	functionRequest := buildStandardFunctionRequest(c.instance.FunctionContextType, context)
	jsonData, _ = json.Marshal(functionRequest)
	return base64Encoding(string(jsonData))
}

type EventTriggerContextBuilder struct {
	instance *FunctionInstance
}

func (c *EventTriggerContextBuilder) BuildEncodedJSONContext(context FunctionContext, input ...interface{}) string {

	var request JobRequest
	if len(input) == 1 {
		request = input[0].(JobRequest)
	}
	var jsonData []byte
	functionRequest := buildStandardFunctionRequest(c.instance.FunctionContextType, context)
	functionRequest.FunctionContext.BeforeExecution = request.BeforeExecution
	functionRequest.FunctionContext.Command = request.Command
	functionRequest.FunctionContext.Args = request.Args
	functionRequest.FunctionContext.Env = request.Env
	jsonData, _ = json.Marshal(functionRequest)
	return base64Encoding(string(jsonData))
}

func buildStandardFunctionRequest(contextType string, context FunctionContext) FunctionRequest {
	var functionRequest FunctionRequest
	functionRequest.ContextType = contextType
	switch functionRequest.ContextType {
	case ZipFileFunctionContext:
		functionRequest.FunctionContext.Context = context.GetEncodedZipFile()
		functionRequest.FunctionContext.Entrypoint = context.ZipEntrypoint
	case GitProjectFunctionContext:
		functionRequest.FunctionContext.Context = context.GitRepo
		functionRequest.FunctionContext.Entrypoint = context.GitEntrypoint
		functionRequest.FunctionContext.Branch = context.GitBranch
	case RawFunctionContext:
		fallthrough
	default:
		functionRequest.FunctionContext.Context = context.GetEncodedCode()
		functionRequest.FunctionContext.Requirement = context.GetEncodedRequirement()
	}
	return functionRequest
}

type FunctionRequest struct {
	ContextType     string                 `json:"contextType"`
	FunctionContext FunctionRequestContext `json:"functionContext"`
}
type FunctionRequestContext struct {
	Context         string            `json:"context"`
	Requirement     string            `json:"requirement"`
	Entrypoint      string            `json:"entrypoint"`
	Branch          string            `json:"branch"`
	BeforeExecution string            `json:"beforeExecution"`
	Command         string            `json:"command"`
	Args            []string          `json:"args"`
	Env             map[string]string `json:"env"`
}
