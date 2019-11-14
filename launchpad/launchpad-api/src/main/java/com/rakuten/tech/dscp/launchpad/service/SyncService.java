package com.rakuten.tech.dscp.launchpad.service;

import com.rakuten.tech.dscp.launchpad.dao.ModelMgtMapper;
import com.rakuten.tech.dscp.launchpad.dao.PredictApiMapper;
import com.rakuten.tech.dscp.launchpad.entity.PredictApiEntity;
import io.fabric8.kubernetes.api.model.Endpoints;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.client.KubernetesClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SyncService {
    private static final Logger logger = LoggerFactory.getLogger(SyncService.class);

    private final PredictApiMapper predictApiMapper;

    private final KubernetesClient k8sClient;

    private final ApiService apiService;

    private final ModelMgtMapper modelMgtMapper;

    @Autowired
    public SyncService(PredictApiMapper predictApiMapper, KubernetesClient k8sClient, ApiService apiService, ModelMgtMapper modelMgtMapper) {
        this.predictApiMapper = predictApiMapper;
        this.k8sClient = k8sClient;
        this.apiService = apiService;
        this.modelMgtMapper = modelMgtMapper;
    }

    @Scheduled(cron = "0 * * * * *")
    public void syncApiStatus() {
        logger.info("sync api status.");
        List<PredictApiEntity> predictApiEntityList = predictApiMapper.selectAll(null);

        for (PredictApiEntity pae : predictApiEntityList) {
            String apiStatus = pae.getApiStatus();
            String resName = pae.getResName();

            Endpoints endpoints = k8sClient.endpoints().withName(resName).get();
            if (endpoints != null && endpoints.getSubsets().size() > 0 && endpoints.getSubsets().get(0).getAddresses().size() > 0) {
                pae.setApiStatus("Ready");
            } else {
                pae.setApiStatus("Not Ready");
            }
            if (!apiStatus.equals(pae.getApiStatus())) {
                logger.info("change api[{}] status from [{}] to [{}].", resName, apiStatus, pae.getApiStatus());
                predictApiMapper.insertSelective(pae);
            }
        }
    }

    @Scheduled(cron = "0 0/5 * * * *")
    public void syncApiResource() {
        logger.info("sync api resources.");
        List<Pod> pods = k8sClient.pods().withLabel("app=launchpad").list().getItems();
        for (Pod pod : pods) {
            String podName = pod.getMetadata().getLabels().get("component");
            PredictApiEntity predictApiEntity = predictApiMapper.selectByResName(podName);
            if (predictApiEntity == null) {
                logger.info("delete unused api resource, name: {}", pod.getMetadata().getName());
                apiService.deleteApiByResName(pod.getMetadata().getLabels().get("component"));
            }
        }
    }

    @Scheduled(cron = "0 0/5 * * * *")
    public void syncApiData() {
        logger.info("sync api data.");
        List<PredictApiEntity> predictApiEntityList = predictApiMapper.selectAll(null);
        for (PredictApiEntity predictApiEntity : predictApiEntityList) {
            String resName = predictApiEntity.getResName();
            int podCount = k8sClient.pods().withLabel("component", resName).list().getItems().size();
            if (podCount < 1) {
                logger.info("delete unused api data, name: {}", resName);
                apiService.deleteApiByResName(resName);
            }
        }
    }

    @Scheduled(fixedDelay = 10_000)
    public void syncModelVersion() {
        logger.info("sync up model version");
        modelMgtMapper.setupRunVersion();
        modelMgtMapper.removeRunVersion();
    }

}
