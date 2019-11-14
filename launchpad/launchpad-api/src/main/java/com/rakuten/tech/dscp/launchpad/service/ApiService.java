package com.rakuten.tech.dscp.launchpad.service;

import com.github.pagehelper.Page;
import com.rakuten.tech.dscp.launchpad.dao.PredictApiMapper;
import com.rakuten.tech.dscp.launchpad.entity.*;
import com.rakuten.tech.dscp.launchpad.exception.ResourceNotFoundException;
import io.fabric8.kubernetes.api.model.Service;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.extensions.Ingress;
import io.fabric8.kubernetes.client.KubernetesClient;
import me.snowdrop.istio.client.IstioClient;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;

/**
 * Prediction api management Service.
 *
 * @author zhusipeng
 * @date 2019/05/15
 */
@org.springframework.stereotype.Service
public class ApiService extends ResourceService {
    private static final Logger logger = LoggerFactory.getLogger(ApiService.class);
    private static final String API_NAME_PREFIX = "predict-api-";
    private static final String API_PATH_PREFIX = "/predict-api/";
    private static final String APP_LABEL_NAME = "launchpad";
    private final DeploymentService deploymentService;
    private final SvcService svcService;
    private final IngressService ingressService;
    private final PredictApiMapper predictApiMapper;
    @Value("${istio.gateway-name}")
    private String gatewayName;
    @Value("${k8s.ingress.hostname}")
    private String hostName;

    @Autowired
    public ApiService(DeploymentService deploymentService, SvcService svcService, IngressService ingressService, PredictApiMapper predictApiMapper, KubernetesClient k8sClient, IstioClient istioClient) {
        super(k8sClient, istioClient);
        this.deploymentService = deploymentService;
        this.svcService = svcService;
        this.ingressService = ingressService;
        this.predictApiMapper = predictApiMapper;
    }

    public PredictApiEntity createOrReplaceApi(PredictApiVO predictApiVO, Boolean isCreate) {
        String username = predictApiVO.getUsername();
        String apiVersion = predictApiVO.getApiVersion();
        String resName = concatApiName(predictApiVO.getApiName(), username, apiVersion);
        String apiPath = concatApiPath(username, predictApiVO.getApiPath(), apiVersion);
        PredictApiEntity existingApiEntity = predictApiMapper.selectByResName(resName);

        PredictApiEntity predictApiEntity = new PredictApiEntity();
        BeanUtils.copyProperties(predictApiVO, predictApiEntity);
        predictApiEntity.setResName(resName);
        predictApiEntity.setAccessUrl("http://" + hostName + apiPath);
        predictApiEntity.setApiStatus("Not Ready");
        predictApiMapper.replace(predictApiEntity);
        PredictApiEntity newApiEntity = predictApiMapper.selectByResName(resName);

        Map<String, String> resLabels = new HashMap<>(2);
        resLabels.put("app", APP_LABEL_NAME);
        resLabels.put("component", resName);
        resLabels.put("version", apiVersion);

        CompletableFuture k8sDeploy = CompletableFuture.runAsync(() -> {
            ServiceEntity serviceEntity = new ServiceEntity();
            serviceEntity.setName(resName);
            serviceEntity.setLabels(resLabels);
            serviceEntity.setSelectors(resLabels);

            Service service = svcService.createService(serviceEntity);
            if (service == null) {
                throw new ResourceNotFoundException("Creating SVC failed!");
            }
        }).thenRunAsync(() -> {
            DeploymentEntity deploymentEntity = new DeploymentEntity();
            deploymentEntity.setName(resName);
            deploymentEntity.setVersion(apiVersion);
            deploymentEntity.setLabels(resLabels);
            deploymentEntity.setRunId(predictApiVO.getRunId());
            deploymentEntity.setModelPath(predictApiVO.getModelPath());

            Deployment deployment = deploymentService.createDeployment(deploymentEntity);
            if (deployment == null) {
                throw new ResourceNotFoundException("Creating Deployment failed!");
            }
        }).thenRunAsync(() -> {
            IngressEntity ingressEntity = new IngressEntity();
            ingressEntity.setName(resName);
            ingressEntity.setServiceName(resName);
            ingressEntity.setPath(apiPath);

            Ingress ingress = ingressService.createIngress(ingressEntity);
            if (ingress == null) {
                throw new ResourceNotFoundException("Creating Ingress failed!");
            }
        }).exceptionally(e -> {
            String errorMsg = e.getCause().getMessage();
            logger.error("k8s creating resources failed, {}, rollback changes!", errorMsg);
            if (isCreate) {
                newApiEntity.setApiStatusDetail(errorMsg);
                predictApiMapper.replace(newApiEntity);
            } else {
                existingApiEntity.setApiStatusDetail(errorMsg);
                predictApiMapper.replace(existingApiEntity);
            }
            return null;
        });
        return newApiEntity;
    }

    public int deleteApi(Long id) {
        PredictApiEntity predictApiEntity = predictApiMapper.selectByPrimaryKey(id);
        if (predictApiEntity == null) {
            throw new IllegalArgumentException("Predict api doesn't exist");
        }
        String resName = predictApiEntity.getResName();

        int ret = predictApiMapper.deleteByPrimaryKey(id);

        CompletableFuture k8sDeploy = CompletableFuture.runAsync(() -> svcService.deleteService(resName)).thenRunAsync(() -> deploymentService.deleteDeployment(resName)).thenRunAsync(() -> ingressService.deleteIngress(resName)).exceptionally(e -> {
            String errorMsg = e.getCause().getMessage();
            logger.error("k8s deleting resources failed, {}, rollback changes!", errorMsg);
            predictApiEntity.setApiStatusDetail(errorMsg);
            predictApiMapper.replace(predictApiEntity);
            return null;
        });

        return ret;
    }

    @Async
    public Future<Integer> deleteApiByResName(String resName) {
        svcService.deleteService(resName);
        deploymentService.deleteDeployment(resName);
        ingressService.deleteIngress(resName);
        int ret = predictApiMapper.deleteByResName(resName);
        return new AsyncResult<>(ret);
    }

    public Page<PredictApiEntity> getAll(String keyword) {
        return predictApiMapper.selectAll(keyword);
    }

    public PredictApiEntity getById(Long id) {
        return predictApiMapper.selectByPrimaryKey(id);
    }

    public String concatApiName(String apiName, String username, String apiVersion) {
        if (StringUtils.isEmpty(username)) {
            username = "anonymous";
        }
        return API_NAME_PREFIX + username + "-" + apiName + "-" + apiVersion;

    }

    private String concatApiPath(String username, String path, String apiVersion) {
        if (StringUtils.isEmpty(username)) {
            username = "anonymous";
        }
        return API_PATH_PREFIX + username + path + "/" + apiVersion;
    }

}
