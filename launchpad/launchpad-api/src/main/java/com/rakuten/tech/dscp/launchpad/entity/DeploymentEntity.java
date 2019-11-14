package com.rakuten.tech.dscp.launchpad.entity;

import lombok.Data;

import java.util.Map;

@Data
public class DeploymentEntity {
    private String apiVersion;
    private String name;
    private String version;
    private Map<String, String> labels;
    private String imageName;
    private String imagePullPolicy = "Always";
    private String runId;
    private String modelPath;
    private Integer containerPort = 5000;

}
