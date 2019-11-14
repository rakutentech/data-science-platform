package com.rakuten.tech.dscp.launchpad.entity;

import lombok.Data;

@Data
public class IngressEntity {
    private String name;
    private String namespace;
    private String path;
    private String serviceName;
    private Integer servicePort = 5000;
    private String rewriteUrl = "/invocations";

}
