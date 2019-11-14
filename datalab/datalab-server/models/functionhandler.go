package models

import (
	"encoding/base64"
	b64 "encoding/base64"
	"errors"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/utils"
)

type FunctionHandlerManager struct {
}

func (this *FunctionHandlerManager) NewFunctionHandlerManager(instance FunctionInstance) FunctionHandler {
	var handler FunctionHandler
	switch instance.FunctionContextType {
	case ZipFileFunctionContext:
		handler = &ZipFileFunctionHandler{
			Instance: instance,
		}
	case GitProjectFunctionContext:
		handler = &GitProjectFunctionHandler{
			Instance: instance,
		}
	case RawFunctionContext:
		fallthrough
	default:
		handler = &RawFunctionHandler{
			Instance: instance,
		}
	}
	return handler
}

type FunctionContext struct {
	Code          string
	Requirement   string
	GitRepo       string
	GitBranch     string
	GitEntrypoint string
	ZipFileData   string
	ZipFileName   string
	ZipEntrypoint string
}

// GetEncodedCode will return non empty context to avoid replace error on deployment
func (c *FunctionContext) GetEncodedCode() string {
	if len(c.Code) == 0 {
		return base64Encoding(" ")
	} else {
		return base64Encoding(c.Code)
	}
}

// GetEncodedRequirement will return non empty context to avoid replace error on deployment
func (c *FunctionContext) GetEncodedRequirement() string {
	if len(c.Requirement) == 0 {
		return base64Encoding(" ")
	} else {
		return base64Encoding(c.Requirement)
	}
}

// GetEncodedRequirement will return non empty context to avoid replace error on deployment
func (c *FunctionContext) GetEncodedZipFile() string {

	if len(c.ZipFileData) == 0 {
		return base64Encoding(" ")
	} else {
		return c.ZipFileData
	}
}

func base64Encoding(context string) string {
	return b64.StdEncoding.EncodeToString([]byte(context))
}

type FunctionHandler interface {
	GetFunctionInstance() FunctionInstance
	GetFunctionRef() string
	GetFunctionContext() *FunctionContext
	ApplyFunctionContext(request FunctionContext) error
	DeleteFunctionContext() error
}

func getFunctionLocalPath(instance FunctionInstance) string {
	return fmt.Sprintf("%s/functions/%s/%s/%s/%s",
		app.GetConfig().DataPath,
		instance.Namespace,
		instance.Owner,
		instance.Trigger,
		instance.Name)
}

type RawFunctionHandler struct {
	Instance FunctionInstance
}

func (fh *RawFunctionHandler) GetFunctionRef() string {
	return getFunctionLocalPath(fh.Instance)
}

func (fh *RawFunctionHandler) GetFunctionInstance() FunctionInstance {
	return fh.Instance
}

func (fh *RawFunctionHandler) ApplyFunctionContext(request FunctionContext) (err error) {
	err = os.MkdirAll(fh.GetFunctionRef(), os.ModePerm)
	if err != nil {
		return err
	}

	codePath := fmt.Sprintf("%s/code", fh.GetFunctionRef())
	requirementPath := fmt.Sprintf("%s/requirement", fh.GetFunctionRef())
	if err = utils.ApplyFile([]byte(request.Code), codePath); err != nil {
		return err
	}
	if err = utils.ApplyFile([]byte(request.Requirement), requirementPath); err != nil {
		return err
	}
	return err
}

func (fh *RawFunctionHandler) DeleteFunctionContext() (err error) {
	return os.RemoveAll(fh.GetFunctionRef())
}

//GetFunctionContext return non emptry string to avoid empty function
func (fh *RawFunctionHandler) GetFunctionContext() *FunctionContext {
	var context FunctionContext
	codePath := fmt.Sprintf("%s/code", fh.GetFunctionRef())
	data, err := ioutil.ReadFile(codePath)
	if err == nil {
		context.Code = string(data)
	}

	requirementPath := fmt.Sprintf("%s/requirement", fh.GetFunctionRef())
	data, err = ioutil.ReadFile(requirementPath)
	if err == nil {
		context.Requirement = string(data)
	}
	return &context
}

type ZipFileFunctionHandler struct {
	Instance FunctionInstance
}

func (fh *ZipFileFunctionHandler) GetFunctionRef() string {
	return getFunctionLocalPath(fh.Instance)
}
func (fh *ZipFileFunctionHandler) GetFunctionInstance() FunctionInstance {
	return fh.Instance
}
func (fh *ZipFileFunctionHandler) GetFunctionContext() *FunctionContext {
	var context FunctionContext
	namePath := fmt.Sprintf("%s/name", fh.GetFunctionRef())
	data, err := ioutil.ReadFile(namePath)
	if err == nil {
		context.ZipFileName = string(data)
	}

	entrypointPath := fmt.Sprintf("%s/entrypoint", fh.GetFunctionRef())
	data, err = ioutil.ReadFile(entrypointPath)
	if err == nil {
		context.ZipEntrypoint = string(data)
	}

	contextPath := fmt.Sprintf("%s/context.zip", fh.GetFunctionRef())
	file, err := os.Open(contextPath)
	if err == nil {
		defer file.Close()
		b, err := ioutil.ReadAll(file)
		if err == nil {
			context.ZipFileData = b64.StdEncoding.EncodeToString(b)
		}
	}

	return &context
}
func (fh *ZipFileFunctionHandler) ApplyFunctionContext(request FunctionContext) (err error) {

	if len(request.ZipFileData) == 0 {
		return errors.New("Empty file")
	}

	err = os.MkdirAll(fh.GetFunctionRef(), os.ModePerm)
	if err != nil {
		return err
	}

	namePath := fmt.Sprintf("%s/name", fh.GetFunctionRef())
	if err = utils.ApplyFile([]byte(request.ZipFileName), namePath); err != nil {
		return err
	}

	entrypointPath := fmt.Sprintf("%s/entrypoint", fh.GetFunctionRef())
	if err = utils.ApplyFile([]byte(request.ZipEntrypoint), entrypointPath); err != nil {
		return err
	}

	contextPath := fmt.Sprintf("%s/context.zip", fh.GetFunctionRef())
	dec, err := base64.StdEncoding.DecodeString(request.ZipFileData)
	ioutil.WriteFile(contextPath, dec, 0666)
	return err
}
func (fh *ZipFileFunctionHandler) DeleteFunctionContext() (err error) {
	return os.RemoveAll(fh.GetFunctionRef())
}

type GitProjectFunctionHandler struct {
	Instance FunctionInstance
}

func (fh *GitProjectFunctionHandler) GetFunctionRef() string {
	return getFunctionLocalPath(fh.Instance)
}
func (fh *GitProjectFunctionHandler) GetFunctionInstance() FunctionInstance {
	return fh.Instance
}
func (fh *GitProjectFunctionHandler) GetFunctionContext() *FunctionContext {
	var context FunctionContext
	repoPath := fmt.Sprintf("%s/gitrepo", fh.GetFunctionRef())
	data, err := ioutil.ReadFile(repoPath)
	if err == nil {
		context.GitRepo = string(data)
	}

	entrypointPath := fmt.Sprintf("%s/entrypoint", fh.GetFunctionRef())
	data, err = ioutil.ReadFile(entrypointPath)
	if err == nil {
		context.GitEntrypoint = string(data)
	}

	branchPath := fmt.Sprintf("%s/branch", fh.GetFunctionRef())
	data, err = ioutil.ReadFile(branchPath)
	if err == nil {
		context.GitBranch = string(data)
	}

	return &context
}
func (fh *GitProjectFunctionHandler) ApplyFunctionContext(request FunctionContext) (err error) {
	err = os.MkdirAll(fh.GetFunctionRef(), os.ModePerm)
	if err != nil {
		return err
	}

	repoPath := fmt.Sprintf("%s/gitrepo", fh.GetFunctionRef())
	if err = utils.ApplyFile([]byte(request.GitRepo), repoPath); err != nil {
		return err
	}

	entrypointPath := fmt.Sprintf("%s/entrypoint", fh.GetFunctionRef())
	if err = utils.ApplyFile([]byte(request.GitEntrypoint), entrypointPath); err != nil {
		return err
	}

	branchPath := fmt.Sprintf("%s/branch", fh.GetFunctionRef())
	if err = utils.ApplyFile([]byte(request.GitBranch), branchPath); err != nil {
		return err
	}
	return err
}
func (fh *GitProjectFunctionHandler) DeleteFunctionContext() (err error) {
	return os.RemoveAll(fh.GetFunctionRef())
}
