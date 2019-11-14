package com.rakuten.tech.dscp.launchpad.aop;

import org.springframework.boot.actuate.trace.http.HttpExchangeTracer;
import org.springframework.boot.actuate.trace.http.HttpTraceRepository;
import org.springframework.boot.actuate.web.trace.servlet.HttpTraceFilter;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;

/**
 * config for unify log.
 *
 * @author Forest Meng
 * @date 2018/12/18
 */
@Component
public class RequestTraceFilter extends HttpTraceFilter {
    private final String[] excludedEndpoints = new String[]{"/actuator/**", "/v2/api-docs/**", "/swagger-ui.html", "/swagger-resources/**", "/webjars/**"};

    /**
     * Create a new {@link HttpTraceFilter} instance.
     *
     * @param repository the trace repository
     * @param tracer     used to trace exchanges
     */
    public RequestTraceFilter(HttpTraceRepository repository, HttpExchangeTracer tracer) {
        super(repository, tracer);
    }

    @Override
    protected boolean shouldNotFilter(final HttpServletRequest request) {
        return Arrays.stream(excludedEndpoints).anyMatch(e -> new AntPathMatcher().match(e, request.getServletPath()));
    }

}
