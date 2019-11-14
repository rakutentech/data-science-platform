package com.rakuten.tech.dscp.launchpad.entity;

import lombok.Data;

import java.util.Map;

@Data
public class ServiceEntity {
    private String name;
    private Map<String, String> labels;
    private Map<String, String> selectors;
    private Integer port = 5000;

}
