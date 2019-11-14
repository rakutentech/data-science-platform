package com.rakuten.tech.dscp.launchpad.service;

import com.rakuten.tech.dscp.launchpad.entity.GatewayEntity;
import io.fabric8.kubernetes.client.KubernetesClient;
import me.snowdrop.istio.api.networking.v1alpha3.Gateway;
import me.snowdrop.istio.api.networking.v1alpha3.GatewayBuilder;
import me.snowdrop.istio.client.IstioClient;
import org.springframework.stereotype.Service;

/**
 * Istio gateway management Service.
 *
 * @author zhusipeng
 * @date 2019/05/15
 */
@Service
public class GatewayService extends ResourceService {
    public GatewayService(KubernetesClient k8sClient, IstioClient istioClient) {
        super(k8sClient, istioClient);
    }

    public Gateway createGateway(GatewayEntity gwEntity) {
        Gateway gateway = new GatewayBuilder().withApiVersion(gwEntity.getApiVersion()).withNewMetadata().withName(gwEntity.getName()).endMetadata().withNewSpec().withSelector(gwEntity.getSelectors()).addNewServer().withNewPort(gwEntity.getPort().getName(), gwEntity.getPort().getNumber(), gwEntity.getPort().getProtocol()).withHosts(gwEntity.getHost()).endServer().endSpec().build();

        gateway = istioClient.gateway().createOrReplace(gateway);
        return gateway;
    }

    public Gateway getGateway(String gatewayName) {
        return istioClient.gateway().withName(gatewayName).get();
    }

    public boolean deleteGateway(String gatewayName) {
        return istioClient.gateway().withName(gatewayName).delete();
    }
}
