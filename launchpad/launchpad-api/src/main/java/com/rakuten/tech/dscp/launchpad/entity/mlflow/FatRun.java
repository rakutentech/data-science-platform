package com.rakuten.tech.dscp.launchpad.entity.mlflow;

import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = false)
@Data
public class FatRun extends Run {

    private String paramKey;

    private String paramValue;

    private String metricKey;

    private Double metricValue;

    private Long metricTimestamp;

    private String tagKey;

    private String tagValue;

    private String accessUrl;

    private Long predApiId;
}
