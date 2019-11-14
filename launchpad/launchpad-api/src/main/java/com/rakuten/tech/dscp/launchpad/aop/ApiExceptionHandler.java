package com.rakuten.tech.dscp.launchpad.aop;

import com.rakuten.tech.dscp.launchpad.dto.ApiResponseEntity;
import com.rakuten.tech.dscp.launchpad.exception.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.web.util.WebUtils;

import java.util.List;

@RestControllerAdvice
@Slf4j
public class ApiExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(code = HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponseEntity internalErrorHandler(Exception exception, ServletWebRequest request) {
        log.error("{}", ExceptionUtils.getStackTrace(exception));
        return new ApiResponseEntity(HttpStatus.INTERNAL_SERVER_ERROR.value(), HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(), exception.getMessage(), request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(code = HttpStatus.NOT_FOUND)
    public ApiResponseEntity notFoundHandler(Exception exception, ServletWebRequest request) {
        log.warn("{}", exception.getMessage());
        return new ApiResponseEntity(HttpStatus.NOT_FOUND.value(), HttpStatus.NOT_FOUND.getReasonPhrase(), exception.getMessage(), request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(code = HttpStatus.BAD_REQUEST)
    public ApiResponseEntity illegalArgumentException(Exception exception, ServletWebRequest request) {
        log.warn("{}", exception.getMessage());
        return new ApiResponseEntity(HttpStatus.BAD_REQUEST.value(), HttpStatus.BAD_REQUEST.getReasonPhrase(), exception.getMessage(), request);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception exception, @Nullable Object body, HttpHeaders headers, HttpStatus status, WebRequest request) {
        log.warn("{}", exception.getMessage());

        if (HttpStatus.INTERNAL_SERVER_ERROR.equals(status)) {
            request.setAttribute(WebUtils.ERROR_EXCEPTION_ATTRIBUTE, exception, WebRequest.SCOPE_REQUEST);
        }
        if (exception instanceof MethodArgumentNotValidException) {
            MethodArgumentNotValidException e = (MethodArgumentNotValidException) exception;
            BindingResult result = e.getBindingResult();
            List<FieldError> fieldErrors = result.getFieldErrors();
            String errMsg = "Invalid parameter!";
            if (fieldErrors.size() > 0) {
                String[] errMsgArr = fieldErrors.get(0).toString().split(";");
                errMsg = errMsgArr[errMsgArr.length - 1].replace(" default message ", " Parameter Invalid: ");
            }

            ServletWebRequest servletWebRequest = (ServletWebRequest) request;
            ApiResponseEntity apiResponseEntity = new ApiResponseEntity(status.value(), status.getReasonPhrase(), errMsg, servletWebRequest);
            return new ResponseEntity<>(apiResponseEntity, headers, status);

        }

        ServletWebRequest servletWebRequest = (ServletWebRequest) request;
        ApiResponseEntity apiResponseEntity = new ApiResponseEntity(status.value(), status.getReasonPhrase(), exception.getMessage(), servletWebRequest);
        return new ResponseEntity<>(apiResponseEntity, headers, status);
    }

}
