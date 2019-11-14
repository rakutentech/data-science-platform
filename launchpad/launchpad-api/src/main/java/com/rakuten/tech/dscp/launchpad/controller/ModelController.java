package com.rakuten.tech.dscp.launchpad.controller;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.rakuten.tech.dscp.launchpad.dto.ApiResponseEntity;
import com.rakuten.tech.dscp.launchpad.entity.ExperimentEntity;
import com.rakuten.tech.dscp.launchpad.entity.PageForm;
import com.rakuten.tech.dscp.launchpad.service.ModelService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(path = "/v1/models")
@Api(tags = "model APIs", description = "APIs for models' CRUD")
@Slf4j
public class ModelController {

    private final ModelService modelService;

    @Autowired
    public ModelController(ModelService modelService) {
        this.modelService = modelService;
    }

    @GetMapping("")
    @ApiOperation(value = "get model list", tags = "v1")
    public ApiResponseEntity listModels(@RequestParam(name = "keyword", defaultValue = "") String keyword, PageForm pageForm) {
        PageHelper.startPage(pageForm);
        PageInfo<ExperimentEntity> features = new PageInfo<>(this.modelService.listExperiment(keyword));
        return new ApiResponseEntity(features);
    }

    @GetMapping("/{id}")
    @ApiOperation(value = "get model info by id", tags = "v1")
    public ApiResponseEntity getModelInfo(@PathVariable int id) {
        return new ApiResponseEntity(this.modelService.getExperiment(id));
    }

    @Deprecated
    @DeleteMapping("/{id}")
    @ApiOperation(value = "delete model completely", tags = "v1")
    public ApiResponseEntity deleteModel(@PathVariable int id) {
        log.info("deleteModel id: {}", id);
        return new ApiResponseEntity(this.modelService.deleteExperiment(id, true));
    }

    @DeleteMapping("/{id}/soft")
    @ApiOperation(value = "mark model as deleted", tags = "v1")
    public ApiResponseEntity softDeleteModel(@PathVariable int id) {
        return new ApiResponseEntity(this.modelService.deleteExperiment(id, false));
    }

    @DeleteMapping("/{id}/hard")
    @ApiOperation(value = "delete model completely", tags = "v1")
    public ApiResponseEntity hardDeleteModel(@PathVariable int id) {
        return new ApiResponseEntity(this.modelService.deleteExperiment(id, true));
    }

    @PostMapping("/{id}/restore")
    @ApiOperation(value = "restore model", tags = "v1")
    public ApiResponseEntity restoreModel(@PathVariable int id) {
        return new ApiResponseEntity(this.modelService.restoreExperiment(id));
    }

    @GetMapping("/{id}/versions")
    @ApiOperation(value = "get versions list by model id", tags = "v1")
    public ApiResponseEntity listVersions(@PathVariable int id) {
        return new ApiResponseEntity(this.modelService.listRunInfo(id));
    }

    @GetMapping("/{id}/versions/{uuid}")
    @ApiOperation(value = "get version info by uuid", tags = "v1")
    public ApiResponseEntity getVersionInfo(@PathVariable int id, @PathVariable String uuid) {
        return new ApiResponseEntity(this.modelService.getRunInfo(id, uuid));
    }

    @Deprecated
    @DeleteMapping("/{id}/versions/{uuid}")
    @ApiOperation(value = "delete one version of a model completely", tags = "v1")
    public ApiResponseEntity deleteVersion(@PathVariable int id, @PathVariable String uuid) {
        return new ApiResponseEntity(this.modelService.deleteRunInfo(id, uuid, true));
    }

    @DeleteMapping("/{id}/versions/{uuid}/soft")
    @ApiOperation(value = "mark one version of a model as deleted", tags = "v1")
    public ApiResponseEntity softDeleteVersion(@PathVariable int id, @PathVariable String uuid) {
        return new ApiResponseEntity(this.modelService.deleteRunInfo(id, uuid, false));
    }

    @DeleteMapping("/{id}/versions/{uuid}/hard")
    @ApiOperation(value = "delete one version of a model completely", tags = "v1")
    public ApiResponseEntity hardDeleteVersion(@PathVariable int id, @PathVariable String uuid) {
        return new ApiResponseEntity(this.modelService.deleteRunInfo(id, uuid, true));
    }

    @PostMapping("/{id}/versions/{uuid}/restore")
    @ApiOperation(value = "restore one version of a model", tags = "v1")
    public ApiResponseEntity restoreVersion(@PathVariable int id, @PathVariable String uuid) {
        return new ApiResponseEntity(this.modelService.restoreRun(uuid));
    }

    @GetMapping("/{id}/versions/{uuid}/files")
    @ApiOperation(value = "get model files", tags = "v1")
    public ApiResponseEntity getArtifacts(@PathVariable int id, @PathVariable String uuid, String modelPath) {
        return new ApiResponseEntity(this.modelService.getArtifacts(id, uuid, modelPath));
    }

    @GetMapping("/{id}/versions/{uuid}/modelpath")
    @ApiOperation(value = "get model path", tags = "v1")
    public ApiResponseEntity getModelPath(@PathVariable int id, @PathVariable String uuid) {
        return new ApiResponseEntity(this.modelService.getModelPath(id, uuid));
    }

//    @GetMapping("/{id}/versions/{uuid}/artifacts/download")
//    @ApiOperation(value = "download model files ", tags = "v1")
//    public ApiResponseEntity downloadFile(@PathVariable String id, @PathVariable String uuid, @RequestParam String modelFilePath, HttpServletResponse response) throws IOException {
//        return new ApiResponseEntity(this.modelService.downloadFile(id, uuid, modelFilePath, response));
//    }

}
