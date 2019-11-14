package admin

import (
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/kubernetes"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/utils"
	"github.com/astaxie/beego"
)

type ClusterInfoController struct {
	beego.Controller
}

func (c *ClusterInfoController) Get() {
	userManager := models.NewModelManager(models.User{})
	var users []*models.User
	userManager.All(&users)
	groups := make(map[string]*kubernetes.GroupUsage)
	namespaces := make([]string, 0)
	manager := models.NewModelManager(models.LabInstance{})
	var labInstances []*models.LabInstance
	manager.All(&labInstances)
	manager = models.NewModelManager(models.FunctionInstance{})
	var functionInstances []*models.FunctionInstance
	manager.All(&functionInstances)
	manager = models.NewModelManager(models.JobInstance{})
	var jobInstances []*models.JobInstance
	manager.FindInstances(map[string]interface{}{
		"Status": models.Running,
	}, &jobInstances)
	manager = models.NewModelManager(models.InstanceType{})
	var instanceTypes []*models.InstanceType
	manager.All(&instanceTypes)
	instanceTypeMap := make(map[string]*models.InstanceType)
	for _, instanceType := range instanceTypes {
		instanceTypeMap[instanceType.Name] = instanceType
	}

	for _, user := range users {
		if len(user.Group) > 0 {
			if _, ok := groups[user.Group]; ok {
				groups[user.Group].User = groups[user.Group].User + 1
			} else {
				groups[user.Group] = &kubernetes.GroupUsage{
					User:        1,
					JobRunning:  0,
					CPUUsage:    0,
					MemoryUsage: 0,
					GPUUsage:    0,
				}
			}
			for _, instance := range labInstances {
				if instance.Owner == user.Username {
					if instanceType, ok := instanceTypeMap[instance.InstanceTypeName]; ok {
						groups[user.Group].CPUUsage += instanceType.CPU * float64(instance.InstanceNumber)
						groups[user.Group].MemoryUsage += instanceType.Memory * int64(instance.InstanceNumber)
						groups[user.Group].GPUUsage += instanceType.GPU * float64(instance.InstanceNumber)
					}
				}
			}
			for _, instance := range functionInstances {
				if instance.Owner == user.Username && !instance.IsEventTrigger() {
					if instanceType, ok := instanceTypeMap[instance.InstanceTypeName]; ok {
						groups[user.Group].CPUUsage += instanceType.CPU * float64(instance.InstanceNumber)
						groups[user.Group].MemoryUsage += instanceType.Memory * int64(instance.InstanceNumber)
						groups[user.Group].GPUUsage += instanceType.GPU * float64(instance.InstanceNumber)
					}
				}
			}
			for _, instance := range jobInstances {
				if instance.Owner == user.Username {
					groups[user.Group].JobRunning++
					if instanceType, ok := instanceTypeMap[instance.InstanceTypeName]; ok {
						groups[user.Group].CPUUsage += instanceType.CPU * float64(instance.InstanceNumber)
						groups[user.Group].MemoryUsage += instanceType.Memory * int64(instance.InstanceNumber)
						groups[user.Group].GPUUsage += instanceType.GPU * float64(instance.InstanceNumber)
					}
				}
			}

		}
		if len(user.Namespace) > 0 {
			if !utils.Contain(namespaces, user.Namespace) {
				namespaces = append(namespaces, user.Namespace)
			}
		}
	}

	groupUsage := make([]*kubernetes.GroupUsageData, len(groups))
	groupIndex := 0
	for group, usage := range groups {
		groupUsage[groupIndex] = &kubernetes.GroupUsageData{
			Name: group,
			Data: usage,
		}
		groupIndex = groupIndex + 1
	}
	namespaceUsage := make([]*kubernetes.NamespaceUsageData, len(namespaces))
	for i, ns := range namespaces {
		namespaceUsage[i] = &kubernetes.NamespaceUsageData{
			Name: ns,
			Data: kubernetes.GetNamespaceResource(ns),
		}
	}
	c.Data["json"] = &kubernetes.ClusterInfo{
		ResourceUsage: kubernetes.GetTotalResource(),
		Groups:        groupUsage,
		Namespaces:    namespaceUsage,
	}
	c.ServeJSON()
}
