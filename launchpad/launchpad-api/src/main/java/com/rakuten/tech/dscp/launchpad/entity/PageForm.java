package com.rakuten.tech.dscp.launchpad.entity;

import lombok.Data;

@Data
public class PageForm {
    private int pageNum;
    private int pageSize;

    public PageForm() {
        this.pageNum = 1;
        this.pageSize = 1000;
    }
}
