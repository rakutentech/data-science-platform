package com.rakuten.tech.dscp.launchpad.entity;

import lombok.Data;

import java.util.Date;

/**
 * Created by Mybatis Generator 2019/06/25
 */
@Data
public class PredictApiEntity extends PredictApiVO {

    private String resName;

    private String accessUrl;

    private Date createdAt;

    private Date updatedAt;

    private String createdBy;

    private String updatedBy;

    private String apiStatusDetail;
}
