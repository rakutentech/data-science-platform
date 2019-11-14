package kubernetes

import (
	"fmt"
	"strings"

	"github.com/astaxie/beego/logs"
	appsv1 "k8s.io/api/apps/v1"
	batch "k8s.io/api/batch/v1"
	api "k8s.io/api/core/v1"
	v1beta1 "k8s.io/api/extensions/v1beta1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

func FetchPods(namespace string) *api.PodList {
	podList, err := NewCoreV1().Pods(namespace).List(metav1.ListOptions{})
	if err != nil {
		logs.Error(err.Error())
	}
	return podList

}

func FetchServices(namespace string) (serviceList *api.ServiceList) {
	serviceList, err := NewCoreV1().Services(namespace).List(metav1.ListOptions{})
	if err != nil {
		logs.Error(err.Error())
	}
	return serviceList
}

func FetchIngress(namespace string) (ingressList *v1beta1.IngressList) {
	ingressList, err := NewExtensionsV1beta1().Ingresses(namespace).List(metav1.ListOptions{})
	if err != nil {
		logs.Error(err.Error())
	}
	return ingressList
}

func IsPodRunning(pod api.Pod) bool {
	return pod.Status.Phase == api.PodRunning
}

func FindInstanceEndpoint(services []api.Service, UUID string) (endpoint string) {
	for _, service := range services {
		if service.Name == UUID {
			var hostname string
			var port int32

			if len(service.Status.LoadBalancer.Ingress) > 0 {
				//service Type = Node port
				hostname = service.Status.LoadBalancer.Ingress[0].Hostname
			}
			if len(service.Spec.Ports) > 0 {
				//service Type = Node port
				port = service.Spec.Ports[0].NodePort
			}
			endpoint = fmt.Sprintf(
				"http://%s:%d",
				hostname,
				port)
		}
	}
	return endpoint
}

func FetchDeployment(namespace, UUID string) (deployment *appsv1.Deployment) {
	deployment, err := NewAPppsV1().Deployments(namespace).Get(UUID, metav1.GetOptions{})
	if err != nil {
		logs.Error(err.Error())
		return &appsv1.Deployment{}
	}
	return
}

func FetchService(namespace, UUID string) (service *api.Service) {
	service, err := NewCoreV1().Services(namespace).Get(UUID, metav1.GetOptions{})
	if err != nil {
		logs.Error(err.Error())
		return &api.Service{}
	}
	return
}

func FetchJob(namespace, jobID string) (job *batch.Job) {
	job, err := NewBatchV1().Jobs(namespace).Get(jobID, metav1.GetOptions{})
	if err != nil {
		logs.Error(err.Error())
		return &batch.Job{}
	}
	return job
}

func GetInternalEndpoints(namespace, UUID string) []string {
	result := []string{}
	service := FetchService(namespace, UUID)
	for _, portSpec := range service.Spec.Ports {
		result = append(result, fmt.Sprintf("%s:%d", UUID, portSpec.Port))
	}
	return result
}

func GetPodStatus(request *InstanceStatusRequest) *PodStatus {

	if request == nil || request.PodList == nil || request.ServiceList == nil || request.IngressList == nil {
		return &PodStatus{}
	}

	podKey := request.PodStatusHandler.GetPodKey()
	namespace := request.PodStatusHandler.GetPodNamespace()
	externalEndpoint := request.PodStatusHandler.GetPodExternalEndpoint()
	podNumber := request.PodStatusHandler.GetPodNumber()
	matcher := NewPodMatcher(podKey)
	running := 0
	pending := 0
	restart := 0
	URL := ""
	internelEndpoints := []string{}

	if request.PodStatusHandler.IsJob() {
		URL = externalEndpoint
		for _, pod := range request.PodList.Items {
			for _, job := range request.JobInstances {
				if podKey != job.UUID {
					continue
				}
				matcher = NewPodMatcher(job.JobID)
				if matcher.MatchJobID(pod) {
					if IsPodRunning(pod) {
						running++
					} else {
						if pod.Status.Phase != api.PodSucceeded {
							pending++
						}
					}
					for _, container := range pod.Status.ContainerStatuses {
						restart += int(container.RestartCount)
					}
				}
			}
		}
	} else {

		for _, pod := range request.PodList.Items {
			if matcher.MatchUUID(pod) {
				if IsPodRunning(pod) {
					running++
				} else {
					pending++
				}
				for _, container := range pod.Status.ContainerStatuses {
					restart += int(container.RestartCount)
				}
			}
		}

		for _, ingress := range request.IngressList.Items {
			if ingress.Name == podKey {
				for _, rule := range ingress.Spec.Rules {
					path := ""
					if len(rule.HTTP.Paths) > 0 {
						path = rule.HTTP.Paths[0].Path
					}
					URL = fmt.Sprintf("%s%s/", externalEndpoint, path)
				}
			}
		}
		if URL == "" {
			// Find path from svc
			URL = FindInstanceEndpoint(request.ServiceList.Items, podKey)
		}
		if podNumber != pending {
			logs.Warn("[%s] cannot schedlue all pods, expect=[%d], actual=[%d]", podKey, podNumber, pending+running)
		}
		if podNumber > running {
			pending = podNumber - running
		}
		internelEndpoints = GetInternalEndpoints(namespace, podKey)
	}
	return &PodStatus{
		URL:               URL,
		RunningInstances:  running,
		PendingInstances:  pending,
		Restarts:          restart,
		InternalEndpoints: internelEndpoints,
	}
}
func GetPodLog(pod api.Pod) (byteArray []byte, err error) {
	request := NewCoreV1().Pods(pod.Namespace).GetLogs(pod.Name, &api.PodLogOptions{})
	return request.DoRaw()
}

func GetDeploymentLog(namespace, UUID string, limitPerPod int) string {
	podList := FetchPods(namespace)
	result := ""
	matcher := NewPodMatcher(UUID)
	for _, pod := range podList.Items {
		if matcher.MatchUUID(pod) {
			byteArray, err := GetPodLog(pod)
			if err == nil {
				logString := string(byteArray)
				if limitPerPod > 0 {
					lines := strings.Split(logString, "\n")
					logLen := len(lines)
					if logLen > limitPerPod {
						logs.Warn("Pod [%s] log size [%s] is larger than limitPerPod [%s], cut it off",
							pod.Name,
							logLen,
							limitPerPod)
						logString = strings.Join(lines[logLen-limitPerPod:], "\n")
					}
				}
				result = fmt.Sprintf("%sPodName:%s\n---\n%s\n---\n\n", result, pod.Name, logString)
			}
		}
	}
	return result
}
