package models

import (
	"errors"
	"fmt"
	"strings"

	"github.com/astaxie/beego/validation"
)

func Valid(target interface{}) error {
	valid := validation.Validation{}
	b, err := valid.Valid(target)
	if err != nil {
		return err
	}
	if !b {
		// validation does not pass
		var errorMessages []string
		for _, err := range valid.Errors {
			errorMessages = append(errorMessages, fmt.Sprintf("%s %s", err.Key, err.Message))
		}
		return errors.New(strings.Join(errorMessages, "\n"))
	}
	return nil
}

func (instance *FunctionInstance) Valid() error {

	// Check instance format
	err := Valid(instance)
	if err != nil {
		return err
	}

	if instance.Trigger != HTTPTrigger && instance.Trigger != EventTrigger {
		return fmt.Errorf("Unsupported trigger:%s", instance.Trigger)
	}

	if instance.FunctionContextType != GitProjectFunctionContext &&
		instance.FunctionContextType != ZipFileFunctionContext &&
		instance.FunctionContextType != RawFunctionContext {
		return fmt.Errorf("Unsupported context type:%s", instance.FunctionContextType)
	}

	if instance.IsEventTrigger() {
		// skip
		return nil
	}

	// Check ingress path
	// A user cannot create path which already exists
	manager := NewModelManager(FunctionInstance{})
	var instances []*FunctionInstance
	manager.FindInstances(map[string]interface{}{
		"owner": instance.Owner,
	}, &instances)
	for _, target := range instances {
		if !target.IsEventTrigger() && target.IngressPath == instance.IngressPath && target.ID != instance.ID {
			return fmt.Errorf("Duplicate path:%s", target.IngressPath)
		}
	}
	return nil
}
