package com.rakuten.tech.dscp.launchpad.entity;

import lombok.Data;
import me.snowdrop.istio.api.networking.v1alpha3.HTTPMatchRequest;
import me.snowdrop.istio.api.networking.v1alpha3.HTTPRouteDestination;

import java.util.List;

@Data
public class VirtualServiceEntity {
    private String apiVersion = "networking.istio.io/v1alpha3";
    private String name;
    private String gatewayName = "launchpad-gateway";
    private String host = "*";
    private Integer port = 5000;
    private List<HTTPMatchRequest> matchRequests;
    private List<HTTPRouteDestination> routeDestinations;
    private String rewriteUrl = "/invocations";

}
