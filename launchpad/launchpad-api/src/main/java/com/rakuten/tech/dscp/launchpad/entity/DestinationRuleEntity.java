package com.rakuten.tech.dscp.launchpad.entity;

import lombok.Data;

import java.util.Map;

@Data
public class DestinationRuleEntity {
    private String apiVersion = "networking.istio.io/v1alpha3";
    private String name;
    private String version;
    private String host;
    private Map<String, String> labels;
}
