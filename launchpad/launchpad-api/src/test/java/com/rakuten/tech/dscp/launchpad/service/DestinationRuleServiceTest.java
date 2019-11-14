package com.rakuten.tech.dscp.launchpad.service;

import com.rakuten.tech.dscp.launchpad.entity.DestinationRuleEntity;
import me.snowdrop.istio.api.networking.v1alpha3.DestinationRule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DestinationRuleServiceTest extends BaseResourceTest {

    private DestinationRuleService destinationRuleService;

    @BeforeEach
    void setup() {
        destinationRuleService = new DestinationRuleService(kubernetesClient, istioClient);
    }

    @Test
    public void createDestinationRule() {
        DestinationRuleEntity destinationRuleEntity = new DestinationRuleEntity();
        String apiName = "test";
        String apiVersion = "v1";
        Map<String, String> destinationRuleVersions = new HashMap<>(1);
        destinationRuleVersions.put("version", apiVersion);

        destinationRuleEntity.setName(apiName);
        destinationRuleEntity.setVersion(apiVersion);
        destinationRuleEntity.setHost(apiName);
        destinationRuleEntity.setLabels(destinationRuleVersions);
        DestinationRule destinationRule = destinationRuleService.createDestinationRule(destinationRuleEntity);
        assertNotNull(destinationRule);

    }

    @Test
    public void getDestinationRule() {
        String apiName = "test";
        DestinationRule destinationRule = destinationRuleService.getDestinationRule(apiName);
        assertNotNull(destinationRule);
    }

    @Test
    public void deleteDestinationRule() {
        String apiName = "test";
        Boolean result = destinationRuleService.deleteDestinationRule(apiName);
        assertTrue(result);
    }
}
