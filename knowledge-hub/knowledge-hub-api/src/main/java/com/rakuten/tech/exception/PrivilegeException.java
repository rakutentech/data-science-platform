package com.rakuten.tech.exception;

/**
 * Permission exception
 * 
 * @author chienchang.a.huang
 */
public class PrivilegeException extends Exception {

	private static final long serialVersionUID = 7718828512143293558L;

	public PrivilegeException(String message, Throwable cause) {
		super(message, cause);
	}

	public PrivilegeException(String message) {
		super(message);
	}

	public PrivilegeException(Throwable cause) {
		super(cause);
	}
}
