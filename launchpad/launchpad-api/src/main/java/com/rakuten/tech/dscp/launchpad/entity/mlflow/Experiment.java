package com.rakuten.tech.dscp.launchpad.entity.mlflow;

import lombok.Data;

@Data
public class Experiment {

    private int experimentId;

    private String name;

    private String artifactLocation;

    private String lifecycleStage;

}
