package com.rakuten.tech.dscp.launchpad.controller;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.rakuten.tech.dscp.launchpad.dto.ApiResponseEntity;
import com.rakuten.tech.dscp.launchpad.entity.PageForm;
import com.rakuten.tech.dscp.launchpad.entity.PredictApiEntity;
import com.rakuten.tech.dscp.launchpad.entity.PredictApiVO;
import com.rakuten.tech.dscp.launchpad.service.ApiService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * Prediction APIs management Controller.
 *
 * @author zhusipeng
 * @date 2019/05/15
 */
@RestController
@RequestMapping(path = "/v1/api")
@Api(tags = "APIs management", description = "Prediction APIs management")
public class ApiController {
    private final ApiService apiService;

    @Autowired
    public ApiController(ApiService apiService) {
        this.apiService = apiService;
    }

    @PostMapping(path = "")
    @ApiOperation(value = "Create predict API", tags = "v1")
    public ApiResponseEntity add(@Validated @RequestBody PredictApiVO predictApiVO) {
        PredictApiEntity predictApiEntity = apiService.createOrReplaceApi(predictApiVO, true);
        return new ApiResponseEntity(predictApiEntity);
    }

    @PutMapping(path = "")
    @ApiOperation(value = "Update predict API", tags = "v1")
    public ApiResponseEntity update(@Validated @RequestBody PredictApiVO predictApiVO) {
        PredictApiEntity predictApiEntity = apiService.createOrReplaceApi(predictApiVO, false);
        return new ApiResponseEntity(predictApiEntity);
    }

    @DeleteMapping(path = "{id}")
    @ApiOperation(value = "Delete predict API", tags = "v1")
    public ApiResponseEntity delete(@PathVariable Long id) {
        return new ApiResponseEntity(apiService.deleteApi(id));
    }

    @DeleteMapping(path = "")
    @ApiOperation(value = "Delete predict API", tags = "v1")
    public ApiResponseEntity delete(@RequestParam("res_name") String resName) {
        return new ApiResponseEntity(apiService.deleteApiByResName(resName));
    }

    @GetMapping(path = "")
    @ApiOperation(value = "Get all predict APIs", tags = "v1")
    public ApiResponseEntity getAll(@RequestParam(name = "keyword", defaultValue = "") String keyword, PageForm pageForm) {
        PageHelper.startPage(pageForm);
        PageInfo<PredictApiEntity> features = new PageInfo<>(apiService.getAll(keyword));
        return new ApiResponseEntity(features);
    }

    @GetMapping(path = "/{id}")
    @ApiOperation(value = "Get predict API by id", tags = "v1")
    public ApiResponseEntity getAll(@PathVariable Long id) {
        return new ApiResponseEntity(apiService.getById(id));
    }
}
