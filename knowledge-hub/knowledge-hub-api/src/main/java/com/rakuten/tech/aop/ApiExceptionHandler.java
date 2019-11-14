package com.rakuten.tech.aop;

import com.rakuten.tech.dto.ApiResponseEntity;
import com.rakuten.tech.exception.ResourceNotFoundException;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.web.util.WebUtils;

/**
 * Application exception handler
 *
 * @author chienchang.a.huang
 */
@RestControllerAdvice
@Slf4j
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

	/**
	 * Handle internal system exception
	 * 
	 * @param Exception
	 * @param ServletWebRequest
	 * @return response entity
	 */
	@ExceptionHandler(RuntimeException.class)
	@ResponseStatus(code = HttpStatus.INTERNAL_SERVER_ERROR)
	public ApiResponseEntity internalErrorHandler(Exception exception, ServletWebRequest request) {
		log.error("{} => {}", exception.getMessage(), ExceptionUtils.getStackTrace(exception));
		return new ApiResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR.value(),
				HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(), exception.getMessage(), request);
	}

	/**
	 * Handle resource not found exception
	 * 
	 * @param Exception
	 * @param ServletWebRequest
	 * @return response entity
	 */
	@ExceptionHandler(ResourceNotFoundException.class)
	@ResponseStatus(code = HttpStatus.NOT_FOUND)
	public ApiResponseEntity notFoundHandler(Exception exception, ServletWebRequest request) {
		log.warn("{} => {}", exception.getMessage(), ExceptionUtils.getStackTrace(exception));
		return new ApiResponseEntity(HttpStatus.NOT_FOUND.value(), HttpStatus.NOT_FOUND.getReasonPhrase(),
				exception.getMessage(), request);
	}

	/**
	 * Handle bad request exception
	 * 
	 * @param Exception
	 * @param ServletWebRequest
	 * @return response entity
	 */
	@ExceptionHandler(IllegalArgumentException.class)
	@ResponseStatus(code = HttpStatus.BAD_REQUEST)
	public ApiResponseEntity illegalArgumentException(Exception exception, ServletWebRequest request) {
		log.warn("{} => {}", exception.getMessage(), ExceptionUtils.getStackTrace(exception));
		return new ApiResponseEntity(HttpStatus.BAD_REQUEST.value(), HttpStatus.BAD_REQUEST.getReasonPhrase(),
				exception.getMessage(), request);
	}

	/**
	 * Handle internal exception
	 * 
	 * @param Exception
	 * @param Object
	 * @param HttpHeaders
	 * @param HttpStatus
	 * @param WebRequest
	 * @return response entity
	 */
	@Override
	protected ResponseEntity<Object> handleExceptionInternal(Exception exception, @Nullable Object body,
			HttpHeaders headers, HttpStatus status, WebRequest request) {
		log.warn("{} => {}", exception.getMessage(), ExceptionUtils.getStackTrace(exception));

		if (HttpStatus.INTERNAL_SERVER_ERROR.equals(status)) {
			request.setAttribute(WebUtils.ERROR_EXCEPTION_ATTRIBUTE, exception, WebRequest.SCOPE_REQUEST);
		}

		ServletWebRequest servletWebRequest = (ServletWebRequest) request;
		ApiResponseEntity apiResponseEntity = new ApiResponseEntity(status.value(), status.getReasonPhrase(),
				exception.getMessage(), servletWebRequest);
		return new ResponseEntity<>(apiResponseEntity, headers, status);
	}
}
