package com.rakuten.tech.interceptor;

import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.config.annotation.InterceptorRegistration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

/**
 * Login interceptor to log user info in each request
 * 
 * @author chienchang.a.huang
 */
@Component
public class LoginInterceptor implements WebMvcConfigurer {
	private static final Logger logger = LoggerFactory.getLogger(LoginInterceptor.class);
	
	@Override
    public void addInterceptors(InterceptorRegistry registry) {
        InterceptorRegistration ir = registry.addInterceptor(new LoginAdapter());
        ir.addPathPatterns("/**");
        ir.excludePathPatterns("/static/**","/templates/**");
    }
	
	public static class LoginAdapter extends HandlerInterceptorAdapter {

	    private static String MDC_KEY_USER_NAME = "userName";
	    private static String MDC_KEY_NOTEBOOK_ID = "notebookId";
	    private static String MDC_KEY_REQ_ID = "reqId";

	    @Override
	    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
	        MDC.put(MDC_KEY_USER_NAME, request.getHeader("userId"));
	        MDC.put(MDC_KEY_NOTEBOOK_ID, request.getParameter("notebookId"));
	        MDC.put(MDC_KEY_REQ_ID, UUID.randomUUID().toString().substring(0, 8));
	        logger.info(" send request => " + request.getRequestURL());
	        return super.preHandle(request, response, handler);
	    }

	    @Override
	    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable ModelAndView modelAndView) throws Exception {
	        super.postHandle(request, response, handler, modelAndView);
	    }

	    @Override
	    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, @Nullable Exception ex) throws Exception {
	    	logger.info(" request end");
	    	MDC.remove(MDC_KEY_USER_NAME);
	    	MDC.remove(MDC_KEY_NOTEBOOK_ID);
	        MDC.remove(MDC_KEY_REQ_ID);
	        super.afterCompletion(request, response, handler, ex);
	    }

	    @Override
	    public void afterConcurrentHandlingStarted(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
	        super.afterConcurrentHandlingStarted(request, response, handler);
	    }
	}
}


