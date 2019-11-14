package com.rakuten.tech.dscp.launchpad.entity;

import lombok.Data;
import org.mlflow.api.proto.Service;

import java.util.Date;

@Data
public class ExperimentEntity {

    private int experimentId;

    private String name;

    private Date createTime;

    private Date updateTime;

    private String artifactLocation;

    private String lifecycleStage;

    public ExperimentEntity() {
    }

    public ExperimentEntity(Service.Experiment experiment) {
        this.experimentId = Integer.valueOf(experiment.getExperimentId());
        this.name = experiment.getName();
        this.createTime = null;
        this.updateTime = null;
        this.artifactLocation = experiment.getArtifactLocation();
        this.lifecycleStage = experiment.getLifecycleStage();
    }
}
