package com.rakuten.tech.dscp.launchpad.entity;

import lombok.Data;
import org.mlflow.api.proto.Service;

import java.util.List;

@Data
public class RunInfoEntity {

    private long experimentId;

    private String uuid;

    private String name;

    private String sourceName;

    private String sourceType;

    private String sourceVersion;

    private String entryPointName;

    private String userName;

    private String status;

    private Long startTime;

    private Long endTime;

    private String lifecycleStage;

    private String artifactUri;

    private List<ModelEntity.Metric> metricList;

    private List<ModelEntity.Param> paramList;

    private List<ModelEntity.RunTag> tagList;

    private String accessUrl;

    private Long predApiId;

    private String runVersion;

    public RunInfoEntity() {
    }

    public RunInfoEntity(Service.RunInfo runInfo) {
        experimentId = Long.valueOf(runInfo.getExperimentId());

        uuid = runInfo.getRunUuid();

//        name = runInfo.getName();

        artifactUri = runInfo.getArtifactUri();

        userName = runInfo.getUserId();

        status = runInfo.getStatus().name();

        lifecycleStage = runInfo.getLifecycleStage();

        startTime = runInfo.getStartTime();

        endTime = runInfo.getEndTime();

//        sourceName = runInfo.getSourceName();
//
//        sourceType = runInfo.getSourceType().name();
//
//        sourceVersion = runInfo.getSourceVersion();
    }


}
