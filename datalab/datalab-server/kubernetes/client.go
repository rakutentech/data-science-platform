package kubernetes

import (
	"flag"
	"path/filepath"

	"github.com/rakutentech/data-science-platform/datalab/datalab-server/app"
	"github.com/astaxie/beego/logs"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/kubernetes/fake"
	appsv1 "k8s.io/client-go/kubernetes/typed/apps/v1"
	batchv1 "k8s.io/client-go/kubernetes/typed/batch/v1"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"
	extensionsv1beta1 "k8s.io/client-go/kubernetes/typed/extensions/v1beta1"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

var clientset *kubernetes.Clientset
var kubeconfig *string

func init() {
	// Init flag, Avoid flag redefined error
	if home := homedir.HomeDir(); home != "" {
		kubeconfig = flag.String("kubeconfig", filepath.Join(home, ".kube", "config"), "(optional) absolute path to the kubeconfig file")
	} else {
		kubeconfig = flag.String("kubeconfig", "", "absolute path to the kubeconfig file")
	}
	flag.Parse()
}

func ClusterClient() *kubernetes.Clientset {

	if clientset != nil {
		return clientset
	}

	if app.GetConfig().Kube.Mode == app.InCluster {
		config, err := rest.InClusterConfig()
		if err != nil {
			logs.Error(err.Error())
		}
		// creates the clientset
		clientset, err = kubernetes.NewForConfig(config)
		if err != nil {
			logs.Error(err.Error())
		}
	} else if app.GetConfig().Kube.Mode == app.OutOfCluster {

		config, err := clientcmd.BuildConfigFromFlags("", *kubeconfig)
		if err != nil {
			logs.Error(err)
		}
		clientset, err = kubernetes.NewForConfig(config)
		if err != nil {
			logs.Error(err.Error())
		}
	}

	return clientset
}

func NewCoreV1() v1.CoreV1Interface {
	if app.GetConfig().Kube.Mode == app.FakeCluster {
		return fake.NewSimpleClientset().CoreV1()
	} else {
		if ClusterClient() != nil {
			return ClusterClient().CoreV1()
		}
		return nil
	}
}

func NewExtensionsV1beta1() extensionsv1beta1.ExtensionsV1beta1Interface {
	if app.GetConfig().Kube.Mode == app.FakeCluster {
		return fake.NewSimpleClientset().ExtensionsV1beta1()
	} else {
		if ClusterClient() != nil {
			return ClusterClient().ExtensionsV1beta1()
		}
		return nil
	}
}

func NewAPppsV1() appsv1.AppsV1Interface {
	if app.GetConfig().Kube.Mode == app.FakeCluster {
		return fake.NewSimpleClientset().AppsV1()
	} else {
		if ClusterClient() != nil {
			return ClusterClient().AppsV1()
		}
		return nil
	}
}
func NewBatchV1() batchv1.BatchV1Interface {
	if app.GetConfig().Kube.Mode == app.FakeCluster {
		return fake.NewSimpleClientset().BatchV1()
	} else {
		if ClusterClient() != nil {
			return ClusterClient().BatchV1()
		}
		return nil
	}
}
