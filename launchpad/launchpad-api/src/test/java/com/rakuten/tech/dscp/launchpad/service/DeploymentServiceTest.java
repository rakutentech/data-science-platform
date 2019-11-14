package com.rakuten.tech.dscp.launchpad.service;

import com.rakuten.tech.dscp.launchpad.entity.DeploymentEntity;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class DeploymentServiceTest extends BaseResourceTest {

    private DeploymentService deploymentService;

    @BeforeEach
    void setUp() {
        deploymentService = new DeploymentService(kubernetesClient, istioClient);
    }

    @Test
    public void createDeployment() {

        DeploymentEntity deploymentEntity = new DeploymentEntity();

        String apiName = "test";
        String apiVersion = "v1";
        String runId = "xxx";
        String model = "modelPath";

        Map<String, String> deploymentVersion = new HashMap<>(2);
        deploymentVersion.put("app", apiName);
        deploymentVersion.put("version", "v1");

        deploymentEntity.setName(apiName);
        deploymentEntity.setVersion(apiVersion);
        deploymentEntity.setLabels(deploymentVersion);
        deploymentEntity.setRunId(runId);
        deploymentEntity.setModelPath(model);

        Deployment deployment = deploymentService.createDeployment(deploymentEntity);
        assertNotNull(deployment);
    }


    @Test
    public void getDeployment() {
        DeploymentEntity deploymentEntity = new DeploymentEntity();

        String apiName = "test";
        String apiVersion = "v1";
        String runId = "xxx";
        String model = "modelPath";

        Map<String, String> deploymentVersion = new HashMap<>(2);
        deploymentVersion.put("app", apiName);
        deploymentVersion.put("version", "v1");

        deploymentEntity.setName(apiName);
        deploymentEntity.setVersion(apiVersion);
        deploymentEntity.setLabels(deploymentVersion);
        deploymentEntity.setRunId(runId);
        deploymentEntity.setModelPath(model);

        Deployment deployment = deploymentService.createDeployment(deploymentEntity);
        deployment = deploymentService.getDeployment(apiName + "-" + apiVersion);
        assertNotNull(deployment);
    }

    @Test
    public void deleteDeployment() {
        DeploymentEntity deploymentEntity = new DeploymentEntity();

        String apiName = "test";
        String apiVersion = "v1";
        String runId = "xxx";
        String model = "modelPath";

        Map<String, String> deploymentVersion = new HashMap<>(2);
        deploymentVersion.put("app", apiName);
        deploymentVersion.put("version", "v1");

        deploymentEntity.setName(apiName);
        deploymentEntity.setVersion(apiVersion);
        deploymentEntity.setLabels(deploymentVersion);
        deploymentEntity.setRunId(runId);
        deploymentEntity.setModelPath(model);

        deploymentService.createDeployment(deploymentEntity);
        Boolean result = deploymentService.deleteDeployment(apiName + "-" + apiVersion);
        assertTrue(result);
    }
}
