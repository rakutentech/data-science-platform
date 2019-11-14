package kubernetes

import (
	"github.com/rakutentech/data-science-platform/datalab/datalab-server/models"
	api "k8s.io/api/core/v1"
	v1beta1 "k8s.io/api/extensions/v1beta1"
)

type ResourceUsage struct {
	CPUUsage    float64
	CPUTotal    float64
	GPUUsage    float64
	GPUTotal    float64
	MemoryUsage int64
	MemoryTotal int64
}
type GroupUsage struct {
	User        int
	JobRunning  int
	CPUUsage    float64
	GPUUsage    float64
	MemoryUsage int64
}

type GroupUsageData struct {
	Name string
	Data *GroupUsage
}

type NamespaceUsageData struct {
	Name string
	Data *ResourceUsage
}

type PodStatus struct {
	URL               string
	Restarts          int
	InternalEndpoints []string
	RunningInstances  int
	PendingInstances  int
}

type ClusterInfo struct {
	*ResourceUsage
	Groups     []*GroupUsageData
	Namespaces []*NamespaceUsageData
}

type InstanceStatusRequest struct {
	PodStatusHandler models.PodStatusHandler
	JobInstances     []*models.JobInstance
	PodList          *api.PodList
	ServiceList      *api.ServiceList
	IngressList      *v1beta1.IngressList
}
