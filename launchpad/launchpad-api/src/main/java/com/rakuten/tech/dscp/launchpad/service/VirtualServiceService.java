package com.rakuten.tech.dscp.launchpad.service;

import com.rakuten.tech.dscp.launchpad.entity.VirtualServiceEntity;
import io.fabric8.kubernetes.client.KubernetesClient;
import me.snowdrop.istio.api.networking.v1alpha3.VirtualService;
import me.snowdrop.istio.api.networking.v1alpha3.VirtualServiceBuilder;
import me.snowdrop.istio.client.IstioClient;
import org.springframework.stereotype.Service;

/**
 * Istio virtual service management Service.
 *
 * @author zhusipeng
 * @date 2019/05/15
 */
@Service
public class VirtualServiceService extends ResourceService {

    public VirtualServiceService(KubernetesClient k8sClient, IstioClient istioClient) {
        super(k8sClient, istioClient);
    }

    VirtualService createVirtualService(VirtualServiceEntity vsEntity) {
        VirtualService virtualService = new VirtualServiceBuilder().withApiVersion(vsEntity.getApiVersion()).withNewMetadata().withName(vsEntity.getName()).endMetadata().withNewSpec().addToGateways(vsEntity.getGatewayName()).addToHosts(vsEntity.getHost()).addNewHttp().withMatch(vsEntity.getMatchRequests()).withNewRewrite().withUri(vsEntity.getRewriteUrl()).endRewrite().withRoute(vsEntity.getRouteDestinations()).endHttp().endSpec().build();
        virtualService = istioClient.virtualService().createOrReplace(virtualService);

        return virtualService;
    }

    public VirtualService getVirtualService(String virtualServiceName) {
        return istioClient.virtualService().withName(virtualServiceName).get();
    }

    boolean deleteVirtualService(String virtualServiceName) {
        return istioClient.virtualService().withName(virtualServiceName).delete();
    }
}
