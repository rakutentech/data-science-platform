package com.rakuten.tech.dto;

import java.util.Date;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.web.context.request.ServletWebRequest;


/**
 * Response Entity for version 2 - snake case
 * 
 * @author chienchang.a.huang
 */
@Data
public class ApiResponseEntityV2 {
  private Date timestamp = new Date();
  private int status;
  private String error;
  private String exception;
  private String message;
  private String path;
  private String method;
  private Object data;
  
  public ApiResponseEntityV2() {
	    this.status = HttpStatus.OK.value();
	    this.message = "success";
  }
  
  public ApiResponseEntityV2(Object data) {
    this.status = HttpStatus.OK.value();
    this.data = data;
    this.message = "success";
  }

  public ApiResponseEntityV2(int status, String error, String message,
      ServletWebRequest servletWebRequest) {
    this.status = status;
    this.error = error;
    this.message = message;
    this.path = servletWebRequest.getRequest().getRequestURI();
    this.method = servletWebRequest.getHttpMethod().name();
  }

  public ApiResponseEntityV2(int status, String error, String message, String exception, String path,
      String method) {
    this.status = status;
    this.error = error;
    this.exception = exception;
    this.message = message;
    this.path = path;
    this.method = method;
  }
}
