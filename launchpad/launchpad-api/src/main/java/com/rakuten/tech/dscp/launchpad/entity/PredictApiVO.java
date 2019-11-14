package com.rakuten.tech.dscp.launchpad.entity;

import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;
import java.util.Objects;

@Data
public class PredictApiVO {
    private Long id;

    @NotEmpty(message = "apiName is required")
    @Pattern(regexp = "^[a-z]([-a-z0-9]*[a-z0-9])?$", message = "Valid apiName is letters a–z, and digits 0–9, and '-'")
    private String apiName;

    @NotEmpty(message = "apiVersion is required")
    @Pattern(regexp = "^[a-z]([-a-z0-9]*[a-z0-9])?$", message = "Valid apiVersion is letters a–z, and digits 0–9, and '-'")
    private String apiVersion;

    @NotEmpty(message = "apiPath is required")
    private String apiPath;

    private String apiDes;

    private String apiStatus;

    @NotEmpty(message = "username is required")
    @Pattern(regexp = "[a-z]([-a-z0-9]*[a-z0-9])?$", message = "Valid username is letters a–z, and digits 0–9, and '-'")
    private String username;

    @NotEmpty(message = "runId is required")
    private String runId;

    @NotEmpty(message = "modelPath is required")
    private String modelPath;

    private Integer modelId;

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        PredictApiVO that = (PredictApiVO) o;
        return Objects.equals(id, that.id) && Objects.equals(apiName, that.apiName) && Objects.equals(apiVersion, that.apiVersion) && Objects.equals(apiPath, that.apiPath) && Objects.equals(apiDes, that.apiDes) && Objects.equals(username, that.username) && Objects.equals(runId, that.runId) && Objects.equals(modelPath, that.modelPath) && Objects.equals(modelId, that.modelId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, apiName, apiVersion, apiPath, apiDes, username, runId, modelPath, modelId);
    }
}
