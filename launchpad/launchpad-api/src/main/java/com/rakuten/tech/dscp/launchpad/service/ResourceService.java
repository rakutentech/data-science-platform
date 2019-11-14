package com.rakuten.tech.dscp.launchpad.service;

import io.fabric8.kubernetes.client.KubernetesClient;
import me.snowdrop.istio.client.IstioClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

/**
 * k8s resource management Service.
 *
 * @author zhusipeng
 * @date 2019/05/15
 */
@org.springframework.stereotype.Service
public abstract class ResourceService {

    final KubernetesClient k8sClient;
    final IstioClient istioClient;
    @Value("${k8s.ns.launchpad}")
    String nsLaunchpad = "default";

    @Autowired
    public ResourceService(KubernetesClient k8sClient, IstioClient istioClient) {
        this.k8sClient = k8sClient;
        this.istioClient = istioClient;
    }
}
