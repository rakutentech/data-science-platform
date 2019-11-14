package com.rakuten.tech.dscp.launchpad.entity.mlflow;

import lombok.Data;

@Data
public class Run {

    private String runUuid;

    private String name;

    private String sourceType;

    private String sourceName;

    private String sourceVersion;

    private String entryPointName;

    private String userId;

    private String status;

    private Long startTime;

    private Long endTime;

    private String lifecycleStage;

    private String artifactUri;

    private int experimentId;

    private String runVersion;
}
