package kubernetes

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func GetTotalResource() *ResourceUsage {
	coreV1 := NewCoreV1()
	if coreV1 == nil {
		return &ResourceUsage{}
	}
	nodeList, _ := coreV1.Nodes().List(metav1.ListOptions{})
	var milliCPUTotal int64
	var milliGPUTotal int64
	var milliMemoryTotal int64
	for _, node := range nodeList.Items {
		milliCPUTotal += node.Status.Allocatable.Cpu().MilliValue()
		milliGPUTotal += gpuMilliValue(node.Status.Allocatable)
		milliMemoryTotal += node.Status.Allocatable.Memory().MilliValue()
	}
	var namespaceList, _ = coreV1.Namespaces().List(metav1.ListOptions{})

	var milliCPUUsage int64
	var milliGPUUsage int64
	var milliMemoryUsage int64
	for _, ns := range namespaceList.Items {
		podList, _ := coreV1.Pods(ns.Name).List(metav1.ListOptions{})
		for _, pod := range podList.Items {
			for _, container := range pod.Spec.Containers {
				milliCPUUsage += container.Resources.Requests.Cpu().MilliValue()
				milliGPUUsage += gpuMilliValue(container.Resources.Requests)
				milliMemoryUsage += container.Resources.Requests.Memory().MilliValue()
			}
		}
	}
	return &ResourceUsage{
		CPUUsage:    float64(milliCPUUsage) / 1000.0,
		CPUTotal:    float64(milliCPUTotal) / 1000.0,
		GPUUsage:    float64(milliGPUUsage) / 1000.0,
		GPUTotal:    float64(milliGPUTotal) / 1000.0,
		MemoryUsage: milliMemoryUsage / 1000,
		MemoryTotal: milliMemoryTotal / 1000,
	}
}

func GetNamespaceResource(ns string) *ResourceUsage {
	coreV1 := NewCoreV1()
	quotaList, _ := coreV1.ResourceQuotas(ns).List(metav1.ListOptions{})

	var milliCPUTotal int64
	var milliGPUTotal int64
	var milliMemoryTotal int64
	var milliCPUUsage int64
	var milliGPUUsage int64
	var milliMemoryUsage int64
	for _, quota := range quotaList.Items {
		cpu := quota.Status.Hard["limits.cpu"]
		gpu := quota.Status.Hard["requests.nvidia.com/gpu"]
		memory := quota.Status.Hard["limits.memory"]
		milliCPUTotal += cpu.MilliValue()
		milliGPUTotal += gpu.MilliValue()
		milliMemoryTotal += memory.MilliValue()
		cpu = quota.Status.Used["limits.cpu"]
		gpu = quota.Status.Used["requests.nvidia.com/gpu"]
		memory = quota.Status.Used["limits.memory"]
		milliCPUUsage += cpu.MilliValue()
		milliGPUUsage += gpu.MilliValue()
		milliMemoryUsage += memory.MilliValue()
	}
	return &ResourceUsage{
		CPUUsage:    float64(milliCPUUsage) / 1000.0,
		CPUTotal:    float64(milliCPUTotal) / 1000.0,
		GPUUsage:    float64(milliGPUUsage) / 1000.0,
		GPUTotal:    float64(milliGPUTotal) / 1000.0,
		MemoryUsage: milliMemoryUsage / 1000,
		MemoryTotal: milliMemoryTotal / 1000,
	}
}

// gpuMilliValue is for fetching gpu value, because it still not stable on api
func gpuMilliValue(resource corev1.ResourceList) (milliValue int64) {
	if _, ok := resource["nvidia.com/gpu"]; ok {
		gpu := resource["nvidia.com/gpu"]
		milliValue = gpu.MilliValue()
	}
	return milliValue
}
