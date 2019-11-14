package com.rakuten.tech.exception;

/**
 * Resource not found exception
 * 
 * @author chienchang.a.huang
 */
public class ResourceNotFoundException extends Exception {

  private static final long serialVersionUID = 4576474118338708627L;

  public ResourceNotFoundException() {
  }

  public ResourceNotFoundException(String message) {
    super(message);
  }

  public ResourceNotFoundException(String message, Throwable cause) {
    super(message, cause);
  }

  public ResourceNotFoundException(Throwable cause) {
    super(cause);
  }

  public ResourceNotFoundException(String message, Throwable cause, boolean enableSuppression,
      boolean writableStackTrace) {
    super(message, cause, enableSuppression, writableStackTrace);
  }
}
