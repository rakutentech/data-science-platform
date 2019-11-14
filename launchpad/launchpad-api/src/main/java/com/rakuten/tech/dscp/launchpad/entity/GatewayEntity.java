package com.rakuten.tech.dscp.launchpad.entity;

import lombok.Data;
import me.snowdrop.istio.api.networking.v1alpha3.Port;

import java.util.Map;

@Data
public class GatewayEntity {
    private String apiVersion = "networking.istio.io/v1alpha3";
    private String name;
    private String host;
    private Map<String, String> selectors;
    private Port port = new Port("http", 80, "HTTP");

}
