package com.rakuten.tech.dscp.launchpad.dto;

import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.web.context.request.ServletWebRequest;

import java.util.Date;

@Data
public class ApiResponseEntity {
    private Date timestamp = new Date();
    private int status;
    private String error;
    private String exception;
    private String message;
    private String path;
    private String method;
    private Object data;

    public ApiResponseEntity(Object data) {
        this.status = HttpStatus.OK.value();
        this.data = data;
        this.message = "success";
    }

    public ApiResponseEntity(int status, String error, String message, ServletWebRequest servletWebRequest) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = servletWebRequest.getRequest().getRequestURI();
        this.method = servletWebRequest.getHttpMethod().name();
    }

    public ApiResponseEntity(int status, String error, String message, String exception, String path, String method) {
        this.status = status;
        this.error = error;
        this.exception = exception;
        this.message = message;
        this.path = path;
        this.method = method;
    }
}
