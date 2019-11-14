package com.rakuten.tech.dscp.launchpad.service;

import com.rakuten.tech.dscp.launchpad.entity.IngressEntity;
import io.fabric8.kubernetes.api.model.IntOrString;
import io.fabric8.kubernetes.api.model.extensions.HTTPIngressPath;
import io.fabric8.kubernetes.api.model.extensions.Ingress;
import io.fabric8.kubernetes.api.model.extensions.IngressBackend;
import io.fabric8.kubernetes.api.model.extensions.IngressBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import me.snowdrop.istio.client.IstioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;

/**
 * k8s deployment management Service.
 *
 * @author zhusipeng
 * @date 2019/06/18
 */
@Service
public class IngressService extends ResourceService {

    @Value("${k8s.ingress.class}")
    private String ingressClass;

    @Value("${k8s.ingress.hostname}")
    private String hostname;

    public IngressService(KubernetesClient k8sClient, IstioClient istioClient) {
        super(k8sClient, istioClient);
    }

    public Ingress createIngress(IngressEntity ingressEntity) {

        HTTPIngressPath httpIngressPath = new HTTPIngressPath();
        httpIngressPath.setPath(ingressEntity.getPath());
        IngressBackend ingressBackend = new IngressBackend(ingressEntity.getServiceName(), new IntOrString(ingressEntity.getServicePort()));
        httpIngressPath.setBackend(ingressBackend);

        HashMap<String, String> annotations = new HashMap<>(8);
        annotations.put("kubernetes.io/ingress.class", ingressClass);
        annotations.put("kubernetes.io/tls-acme", "true");
        annotations.put("nginx.ingress.kubernetes.io/enable-cors", "false");
        annotations.put("nginx.ingress.kubernetes.io/configuration-snippet", "rewrite " + ingressEntity.getPath() + " " + ingressEntity.getRewriteUrl() + " break;");
        annotations.put("nginx.ingress.kubernetes.io/proxy-body-size", "50m");
        annotations.put("nginx.ingress.kubernetes.io/proxy-read-timeout", "300");
        annotations.put("nginx.ingress.kubernetes.io/proxy-send-timeout", "300");

        Ingress ingress = new IngressBuilder().withNewMetadata().withName(ingressEntity.getName()).addToAnnotations(annotations).endMetadata().withNewSpec().addNewRule().withHost(hostname).withNewHttp().addToPaths(httpIngressPath).endHttp().endRule().endSpec().build();

        ingress = k8sClient.extensions().ingresses().createOrReplace(ingress);
        return ingress;
    }

    boolean deleteIngress(String ingressName) {
        return k8sClient.extensions().ingresses().withName(ingressName).delete();
    }
}
