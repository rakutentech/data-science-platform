package com.rakuten.tech;

import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.SystemDefaultRoutePlanner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import com.rakuten.tech.config.DefaultProxySelector;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@SpringBootApplication
@EnableCaching
@EnableScheduling
@EnableSwagger2
/**
 * Spring boot application servlet 
 *
 * @author chienchang.a.huang
 */
public class ApplicationServlet extends SpringBootServletInitializer{

  @Autowired
  DefaultProxySelector defaultProxySelector;

  @Bean
  public HttpClient httpClient() {
    SystemDefaultRoutePlanner routePlanner = new SystemDefaultRoutePlanner(defaultProxySelector);
    CloseableHttpClient httpclient = HttpClients.custom().setRoutePlanner(routePlanner).build();
    return httpclient;
  }

  public static void main(String[] args) {
    SpringApplication.run(ApplicationServlet.class, args);
  }
  
  @Bean
  public Docket docket() {
    return new Docket(DocumentationType.SWAGGER_2)
        .apiInfo(new ApiInfoBuilder()
            .title("Knowledge Hub API").build())
        .useDefaultResponseMessages(false).select()
        .apis(RequestHandlerSelectors.basePackage("com.rakuten.tech.controller"))
        .paths(PathSelectors.any()).build();
  }
  
  /**
	 * Support cross resource access from different host
	 *
	 * @return register CORS filter  
	 */
  @Bean
	public FilterRegistrationBean<CorsFilter> corsFilter() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowCredentials(true);
		config.addAllowedOrigin("*");
		config.addAllowedHeader("*");
		config.addAllowedMethod("*");
		source.registerCorsConfiguration("/**", config);
		FilterRegistrationBean<CorsFilter> filter = new FilterRegistrationBean<CorsFilter>(new CorsFilter(source));
		filter.setOrder(0);
		return filter;
	}
}
