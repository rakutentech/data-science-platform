package com.rakuten.tech.dscp.launchpad.service;

import com.rakuten.tech.dscp.launchpad.entity.DestinationRuleEntity;
import io.fabric8.kubernetes.client.KubernetesClient;
import me.snowdrop.istio.api.networking.v1alpha3.DestinationRule;
import me.snowdrop.istio.api.networking.v1alpha3.DestinationRuleBuilder;
import me.snowdrop.istio.client.IstioClient;
import org.springframework.stereotype.Service;

/**
 * Istio destination rule management Service.
 *
 * @author zhusipeng
 * @date 2019/05/15
 */
@Service
public class DestinationRuleService extends ResourceService {

    public DestinationRuleService(KubernetesClient k8sClient, IstioClient istioClient) {
        super(k8sClient, istioClient);
    }

    DestinationRule createDestinationRule(DestinationRuleEntity destinationRuleEntity) {
        DestinationRule destinationRule = new DestinationRuleBuilder().withApiVersion(destinationRuleEntity.getApiVersion()).withNewMetadata().withName(destinationRuleEntity.getName()).endMetadata().withNewSpec().withHost(destinationRuleEntity.getHost()).addNewSubset().withName(destinationRuleEntity.getVersion()).addToLabels(destinationRuleEntity.getLabels()).endSubset().endSpec().build();

        destinationRule = istioClient.destinationRule().createOrReplace(destinationRule);
        return destinationRule;
    }

    DestinationRule getDestinationRule(String destinationRuleName) {
        return istioClient.destinationRule().withName(destinationRuleName).get();
    }

    boolean deleteDestinationRule(String destinationRuleName) {
        return istioClient.destinationRule().withName(destinationRuleName).delete();
    }
}
