package com.rakuten.tech.dscp.launchpad.aop;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.rakuten.tech.dscp.launchpad.dto.ApiResponseEntity;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.boot.actuate.trace.http.HttpTrace;
import org.springframework.boot.actuate.trace.http.HttpTraceRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.ServletWebRequest;

import java.util.Collections;
import java.util.List;


/**
 * unify log for request and response.
 *
 * @author Forest Meng
 * @date 2018/12/10
 */
@Aspect
@Component
@Slf4j
public class LogHttpTraceRepository implements HttpTraceRepository {

    @Override
    public List<HttpTrace> findAll() {
        return Collections.emptyList();
    }

    @Override
    public void add(HttpTrace trace) {
        HttpTrace.Request request = trace.getRequest();

        HttpTrace.Response response = trace.getResponse();
        long timeToken = trace.getTimeTaken();

        log.info("ip:{}, username:{}, method:{}, path:{}, status:{}, timeToken:{}ms, requestHeader:{}, responseHeader:{}", request.getRemoteAddress(), "anonymous", request.getMethod(), request.getUri().getPath(), response.getStatus(), timeToken, request.getHeaders(), response.getHeaders());
    }

    /**
     * log before and after method called.
     */
    @Around("execution(* com.rakuten.tech.dscp.launchpad..controller..*(..))")
    public Object around(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        String request = "";
        try {
            if (proceedingJoinPoint.getArgs().length > 0) {
                for (Object arg : proceedingJoinPoint.getArgs()) {
                    if (arg instanceof ServletWebRequest) {
                        request = JSON.toJSONString(((ServletWebRequest) arg).getParameterMap());
                    }
                }
            }
            if (StringUtils.isBlank(request)) {
                request = JSON.toJSONString(proceedingJoinPoint.getArgs());
            }
        } catch (Exception e) {
            log.error("parse args error", e);
        }

        Object result = proceedingJoinPoint.proceed();

        JSONObject logJson = (JSONObject) JSON.toJSON(result);
        if (result instanceof ApiResponseEntity && ((ApiResponseEntity) result).getData() != null) {
            if (((ApiResponseEntity) result).getData() instanceof List) {
                int size = ((List) ((ApiResponseEntity) result).getData()).size();
                logJson.put("data", "list size: " + size);
            }

            if (logJson.getString("data").length() > 100) {
                String logResponse = ((ApiResponseEntity) result).getData().getClass().getSimpleName() + " instance";
                logJson.put("data", logResponse);
            }
        }

        log.info("requestParams:{}, responseData:{}", request, logJson);

        return result;
    }
}
