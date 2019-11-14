package com.rakuten.tech.exception;

/**
 * Knowledge Hub internal exception
 * 
 * @author chienchang.a.huang
 */
public class KhException extends Exception {

	private static final long serialVersionUID = 7718828512143293558L;

	public KhException(String message, Throwable cause) {
		super(message, cause);
	}

	public KhException(String message) {
		super(message);
	}

	public KhException(Throwable cause) {
		super(cause);
	}
}
