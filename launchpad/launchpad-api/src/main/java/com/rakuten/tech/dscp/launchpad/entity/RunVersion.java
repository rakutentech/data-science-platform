package com.rakuten.tech.dscp.launchpad.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RunVersion {
    private int experiment_id;
    private String run_uuid;
    private int version;
}
