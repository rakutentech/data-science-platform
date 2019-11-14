package com.rakuten.tech.dscp.launchpad.service;

import com.rakuten.tech.dscp.launchpad.entity.VirtualServiceEntity;
import me.snowdrop.istio.api.networking.v1alpha3.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class VirtualServiceServiceTest extends BaseResourceTest {

    private VirtualServiceService virtualServiceService;

    @BeforeEach
    void setup() {
        virtualServiceService = new VirtualServiceService(kubernetesClient, istioClient);
    }

    @Test
    public void createVirtualService() {
        String apiName = "test";
        String apiVersion = "v1";

        VirtualServiceEntity vsEntity = new VirtualServiceEntity();
        vsEntity.setName(apiName);

        Destination destination = new Destination();
        destination.setHost(apiName);
        destination.setSubset(apiVersion);
        PortSelector portSelector = new PortSelector();
        portSelector.setPort(new NumberPort(vsEntity.getPort()));
        destination.setPort(portSelector);
        HTTPRouteDestination httpRouteDestination = new HTTPRouteDestination();
        httpRouteDestination.setDestination(destination);
        List<HTTPRouteDestination> httpRouteDestinations = new ArrayList<>();
        httpRouteDestinations.add(httpRouteDestination);
        vsEntity.setRouteDestinations(httpRouteDestinations);

        HTTPMatchRequest httpMatchRequest = new HTTPMatchRequest();
        StringMatch stringMatch = new StringMatch();

        stringMatch.setMatchType(new PrefixMatchType("/test"));
        httpMatchRequest.setUri(stringMatch);

        List<HTTPMatchRequest> httpMatchRequests = new ArrayList<>();
        httpMatchRequests.add(httpMatchRequest);
        vsEntity.setMatchRequests(httpMatchRequests);

        VirtualService virtualService = virtualServiceService.createVirtualService(vsEntity);
        assertNotNull(virtualService);
    }

    @Test
    public void getVirtualService() {
        String apiName = "test";
        VirtualService virtualService = virtualServiceService.getVirtualService(apiName);
//        assertNotNull(virtualService);

    }

    @Test
    public void deleteVirtualService() {
        String apiName = "test";
        boolean result = virtualServiceService.deleteVirtualService(apiName);
        assertTrue(result);
    }
}
