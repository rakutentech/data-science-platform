package com.rakuten.tech.dscp.launchpad.controller;

import com.rakuten.tech.dscp.launchpad.dto.ApiResponseEntity;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Api(tags = "Health check API", description = "Check the health status of API")
public class HealthController {

    @GetMapping(path = "/healthz")
    @ApiOperation(value = "Get health status", tags = "v1")
    public ApiResponseEntity health() {
        return new ApiResponseEntity(null);
    }

    @GetMapping(path = "/greeting")
    @ApiOperation(value = "Greeting message", tags = "v1")
    public ApiResponseEntity greeting() {
        return new ApiResponseEntity("welcome launchpad api");
    }
}
