package com.rakuten.tech.dscp.launchpad.service;

import com.rakuten.tech.dscp.launchpad.entity.GatewayEntity;
import me.snowdrop.istio.api.networking.v1alpha3.Gateway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class GatewayServiceTest extends BaseResourceTest {

    private GatewayService gatewayService;

    @BeforeEach
    void setup() {
        gatewayService = new GatewayService(kubernetesClient, istioClient);
    }

    @Test
    public void createGateway() {
        String gatewayName = "test-gateway";

        GatewayEntity gatewayEntity = new GatewayEntity();
        gatewayEntity.setName(gatewayName);
        gatewayEntity.setHost("*");
        Map<String, String> selector = new HashMap<>(1);
        selector.put("istio", "ingressgateway");
        gatewayEntity.setSelectors(selector);

        Gateway gateway = gatewayService.createGateway(gatewayEntity);
        assertNotNull(gateway);

    }

    @Test
    public void getGateway() {
        String gatewayName = "test-gateway";

        Gateway gateway = gatewayService.getGateway(gatewayName);
//        assertNotNull(gateway);
    }

    @Test
    public void deleteGateway() {
        String gatewayName = "test-gateway";
        boolean result = gatewayService.deleteGateway(gatewayName);
        assertTrue(result);
    }
}
