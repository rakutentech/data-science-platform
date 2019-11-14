package com.rakuten.tech.dscp.launchpad.service;

import com.rakuten.tech.dscp.launchpad.entity.ServiceEntity;
import io.fabric8.kubernetes.api.model.Service;
import io.fabric8.kubernetes.api.model.ServiceBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import me.snowdrop.istio.client.IstioClient;

/**
 * k8s svc management Service.
 *
 * @author zhusipeng
 * @date 2019/05/15
 */
@org.springframework.stereotype.Service
public class SvcService extends ResourceService {

    public SvcService(KubernetesClient k8sClient, IstioClient istioClient) {
        super(k8sClient, istioClient);
    }

    Service createService(ServiceEntity serviceEntity) {

        io.fabric8.kubernetes.api.model.Service service = new ServiceBuilder().withNewMetadata().withName(serviceEntity.getName()).withLabels(serviceEntity.getLabels()).endMetadata().withNewSpec().addNewPort().withName("http").withPort(serviceEntity.getPort()).endPort().withSelector(serviceEntity.getSelectors()).endSpec().build();

        return k8sClient.services().createOrReplace(service);
    }

    public Service getService(String serviceName) {
        return k8sClient.services().withName(serviceName).get();
    }

    boolean deleteService(String serviceName) {
        return k8sClient.services().withName(serviceName).delete();
    }
}
