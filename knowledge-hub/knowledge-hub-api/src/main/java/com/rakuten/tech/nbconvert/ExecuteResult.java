package com.rakuten.tech.nbconvert;

import lombok.Data;
import lombok.ToString;

/**
 * ExecuteResult
 * 
 * @author chienchang.a.huang
 */
@Data
@ToString
public class ExecuteResult {
    private int exitCode;
    private String executeOut;

    public ExecuteResult(int exitCode, String executeOut) {
        this.exitCode = exitCode;
        this.executeOut = executeOut;
    }
}