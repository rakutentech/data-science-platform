package com.rakuten.tech.dscp.launchpad.service;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.rakuten.tech.dscp.launchpad.dao.ModelMgtMapper;
import com.rakuten.tech.dscp.launchpad.entity.mlflow.FatRun;
import com.github.pagehelper.Page;
import com.rakuten.tech.dscp.launchpad.dao.PredictApiMapper;
import com.rakuten.tech.dscp.launchpad.entity.ExperimentEntity;
import com.rakuten.tech.dscp.launchpad.entity.ModelEntity;
import com.rakuten.tech.dscp.launchpad.entity.PredictApiEntity;
import com.rakuten.tech.dscp.launchpad.entity.RunInfoEntity;
import com.rakuten.tech.dscp.launchpad.entity.mlflow.Experiment;
import com.rakuten.tech.dscp.launchpad.entity.mlflow.Run;
import com.rakuten.tech.dscp.launchpad.exception.ResourceNotFoundException;
import io.minio.MinioClient;
import io.minio.Result;
import io.minio.messages.Item;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.mlflow.tracking.MlflowClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ModelService {

    private final MlflowClient mlflowClient;
    private final MinioClient minioClient;
    private final ServletContext servletContext;
    private final PredictApiMapper predictApiMapper;
    private final ModelMgtMapper modelMgtMapper;
    @Value("${mlflow.minio.bucket_name}")
    private String bucketName;

    @Autowired
    public ModelService(MlflowClient mlflowClient, MinioClient minioClient, ServletContext servletContext, PredictApiMapper predictApiMapper, ModelMgtMapper modelMgtMapper) {
        this.mlflowClient = mlflowClient;
        this.minioClient = minioClient;
        this.servletContext = servletContext;
        this.predictApiMapper = predictApiMapper;
        this.modelMgtMapper = modelMgtMapper;
    }

    public Page<ExperimentEntity> listExperiment(String keyword) {
        return this.modelMgtMapper.selectAllExperiment(keyword);
    }

    public ExperimentEntity getExperiment(int experimentId) {
        org.mlflow.api.proto.Service.GetExperiment.Response response;
        try {
            response = this.mlflowClient.getExperiment(String.valueOf(experimentId));
        } catch (Exception e) {
            throw new ResourceNotFoundException("resource does not exist", e);
        }
        return response == null ? null : new ExperimentEntity(response.getExperiment());
    }

    /**
     * delete an experiment
     *
     * @param experimentId to be deleted
     * @param hardDelete   if true, delete from hard disk, else mark the experiment as deleted
     * @return experimentId
     */
    @Transactional(rollbackFor = Exception.class)
    public int deleteExperiment(int experimentId, boolean hardDelete) {
        if (predictApiMapper.existModelId((long) experimentId)) {
            throw new IllegalArgumentException("at least one version in this model is in using.");
        }

        if (!hardDelete) {
            this.mlflowClient.deleteExperiment(String.valueOf(experimentId));

        } else {
            List<String> uuidList = this.modelMgtMapper.selectRunUuid(experimentId);
            // delete from db first
            for (String uuid : uuidList) {
                this.deleteRunFromDB(uuid);
            }

            // then delete from s3
            for (String uuid : uuidList) {
                this.deleteRunFromS3(experimentId, uuid);
            }
            this.modelMgtMapper.deleteExperiment(experimentId);
        }

        return experimentId;
    }

    public int restoreExperiment(int experimentId) {
        Experiment experiment = this.modelMgtMapper.selectExperiment(experimentId);
        if (experiment == null) {
            throw new IllegalArgumentException("model " + experimentId + " does not exist.");
        }

        if (experiment.getLifecycleStage().equals("deleted")) {
            this.mlflowClient.restoreExperiment(String.valueOf(experimentId));
        }
        return experimentId;
    }

    public List<RunInfoEntity> listRunInfo(int experimentId) {
        List<FatRun> fatRunList = this.modelMgtMapper.selectAllRunDetail(experimentId);
        return rebuildFatRun(fatRunList);
    }

    private List<RunInfoEntity> rebuildFatRun(List<FatRun> fatRunList) {
        if (fatRunList == null || fatRunList.size() == 0) {
            return new ArrayList<>();
        }

        Map<String, RunInfoEntity> resultMap = new HashMap<>();
        Map<String, Map<String, Map<String, Object>>> runInfoMap = new HashMap<>();

        // basic run info
        for (FatRun fatRun : fatRunList) {
            Map<String, Map<String, Object>> runInfo = runInfoMap.computeIfAbsent(fatRun.getRunUuid(), k -> new HashMap<>());
            RunInfoEntity entity = resultMap.computeIfAbsent(fatRun.getRunUuid(), k -> new RunInfoEntity());
            if (entity.getUuid() == null) {
                entity.setUuid(fatRun.getRunUuid());
                entity.setExperimentId(fatRun.getExperimentId());
                entity.setName(fatRun.getName());
                entity.setArtifactUri(fatRun.getArtifactUri());
                entity.setUserName(fatRun.getUserId());
                entity.setStatus(fatRun.getStatus());
                entity.setLifecycleStage(fatRun.getLifecycleStage());
                entity.setStartTime(fatRun.getStartTime());
                entity.setEndTime(fatRun.getEndTime());
                entity.setSourceName(fatRun.getSourceName());
                entity.setSourceType(fatRun.getSourceType());
                entity.setSourceVersion(fatRun.getSourceVersion());
                entity.setAccessUrl(fatRun.getAccessUrl());
                entity.setPredApiId(fatRun.getPredApiId());
                entity.setRunVersion(fatRun.getRunVersion());
                resultMap.put(fatRun.getRunUuid(), entity);
            }

            String paramKey = fatRun.getParamKey();
            String paramValue = fatRun.getParamValue();
            if (paramKey != null && paramValue != null) {
                runInfo.computeIfAbsent("params", k -> new HashMap<>()).put(paramKey, paramValue);
            }
            String metricKey = fatRun.getMetricKey();
            Double metricValue = fatRun.getMetricValue();
            Long timestamp = fatRun.getMetricTimestamp();
            if (metricKey != null && metricValue != null && timestamp != null) {
                runInfo.computeIfAbsent("metrics", k -> new HashMap<>()).put(metricKey, metricValue + "," + timestamp);
            }
            String tagKey = fatRun.getTagKey();
            String tagValue = fatRun.getTagValue();
            if (tagKey != null && tagValue != null) {
                runInfo.computeIfAbsent("tags", k -> new HashMap<>()).put(tagKey, tagValue);
            }
        }

        // params, metrics, tags
        runInfoMap.forEach((uuid, extendsMap) -> {
            RunInfoEntity runInfoEntity = resultMap.get(uuid);

            // params
            Map<String, Object> paramMap = extendsMap.get("params");
            List<ModelEntity.Param> paramList = new ArrayList<>();
            if (paramMap != null) {
                paramList = paramMap.entrySet().stream().map(entry -> {
                    ModelEntity.Param param = new ModelEntity.Param();
                    param.setKey(entry.getKey());
                    param.setValue((String) entry.getValue());
                    return param;
                }).collect(Collectors.toList());
            }
            runInfoEntity.setParamList(paramList);

            // metrics
            Map<String, Object> metricMap = extendsMap.get("metrics");
            List<ModelEntity.Metric> metricList = new ArrayList<>();
            if (metricMap != null) {
                metricList = metricMap.entrySet().stream().map(entry -> {
                    ModelEntity.Metric metric = new ModelEntity.Metric();
                    metric.setKey(entry.getKey());
                    String[] temp = entry.getValue().toString().split(",");
                    metric.setValue(Double.valueOf(temp[0]));
                    metric.setTimestamp(Long.valueOf(temp[1].substring(0, 10)));
                    return metric;
                }).collect(Collectors.toList());
            }
            runInfoEntity.setMetricList(metricList);

            // tags
            Map<String, Object> tagMap = extendsMap.get("tags");
            if (tagMap != null) {
                List<ModelEntity.RunTag> tagList = tagMap.entrySet().stream().map(entry -> {
                    ModelEntity.RunTag tag = new ModelEntity.RunTag();
                    tag.setKey(entry.getKey());
                    tag.setValue((String) entry.getValue());
                    return tag;
                }).collect(Collectors.toList());
                runInfoEntity.setTagList(tagList);
                runInfoEntity.getTagList().removeIf(tag -> tag.getKey().startsWith("mlflow."));

                Object runName = tagMap.get("mlflow.runName");
                if (runName != null) {
                    runInfoEntity.setName(runName.toString());
                }
                Object sourceName = tagMap.get("mlflow.source.name");
                if (sourceName != null) {
                    runInfoEntity.setSourceName(sourceName.toString());
                }
                Object sourceType = tagMap.get("mlflow.source.type");
                if (sourceType != null) {
                    runInfoEntity.setSourceType(sourceType.toString());
                }
                Object sourceVersion = tagMap.get("mlflow.source.git.commit");
                if (sourceVersion != null) {
                    runInfoEntity.setSourceVersion(sourceVersion.toString());
                }

                runInfoEntity.setTagList(tagList);
            }

        });

        return resultMap.values().stream().sorted(Comparator.comparingLong(RunInfoEntity::getStartTime).reversed()).collect(Collectors.toList());
    }

//    public List<RunInfoEntity> listRunInfo(int experimentId) {
//        return this.mlflowClient.listRunInfos(String.valueOf(experimentId))
//                .stream()
//                .map(runInfo -> getRunInfo(experimentId, runInfo.getRunUuid()))
//                .collect(Collectors.toList());
//    }

    public RunInfoEntity getRunInfo(int experimentId, String uuid) {
        org.mlflow.api.proto.Service.Run run;
        try {
            run = this.mlflowClient.getRun(uuid);
        } catch (Exception e) {
            throw new ResourceNotFoundException("resource does not exist", e);
        }
        RunInfoEntity runInfoEntity = new RunInfoEntity(run.getInfo());
        runInfoEntity.setParamList(listParams(run));
        runInfoEntity.setMetricList(listMetrics(run));
        runInfoEntity.setTagList(listTags(run));
        setRunName(runInfoEntity);
        runInfoEntity.getTagList().removeIf(tag -> tag.getKey().startsWith("mlflow."));

        PredictApiEntity apiEntity = this.predictApiMapper.selectByRunId(uuid);
        if (apiEntity != null) {
            runInfoEntity.setAccessUrl(apiEntity.getAccessUrl());
        }

        return runInfoEntity;
    }

    private void setRunName(RunInfoEntity runInfoEntity) {
        List<ModelEntity.RunTag> tags = runInfoEntity.getTagList();
        if (tags != null && tags.size() > 0) {
            for (ModelEntity.RunTag tag : tags) {
                if (tag.getKey().equals("mlflow.runName")) {
                    runInfoEntity.setName(tag.getValue());
                }
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public String deleteRunInfo(int experimentId, String uuid, boolean hardDelete) {
        if (predictApiMapper.existRunId(uuid)) {
            throw new IllegalArgumentException(uuid + " is in using.");
        }

        if (!hardDelete) {
            this.mlflowClient.deleteRun(uuid);

        } else {
            // remove from db
            this.deleteRunFromDB(uuid);

            // remove from s3
            this.deleteRunFromS3(experimentId, uuid);
        }

        return uuid;
    }

    private void deleteRunFromDB(String uuid) {
//        this.modelMgtMapper.deleteRunFromVersions(uuid);
        this.modelMgtMapper.deleteRunFromTags(uuid);
        this.modelMgtMapper.deleteRunFromParams(uuid);
        this.modelMgtMapper.deleteRunFromMetrics(uuid);
        this.modelMgtMapper.deleteRunFromRuns(uuid);
    }

    private void deleteRunFromS3(int experimentId, String uuid) {
        try {
            Iterable<Result<Item>> objects = this.minioClient.listObjects(this.bucketName, "artifacts/" + experimentId + "/" + uuid, true);
            for (Result<Item> itemResult : objects) {
                this.minioClient.removeObject(this.bucketName, itemResult.get().objectName());
            }
        } catch (Exception e) {
            log.error("error occurs when delete experiment_id:" + experimentId + " run_uuid:" + uuid, e);
        }
    }

    public String restoreRun(String runUuid) {
        Run run = this.modelMgtMapper.selectRun(runUuid);
        if (run == null) {
            throw new IllegalArgumentException("version " + runUuid + " does not exist.");
        }

        if (run.getLifecycleStage().equals("deleted")) {
            this.mlflowClient.restoreRun(runUuid);
        }
        return runUuid;
    }

    public List<ModelEntity.FileInfo> getArtifacts(int experimentId, String uuid, String artifactPath) {
//        List<org.mlflow.api.proto.Service.FileInfo> fileList;
//        if (StringUtils.isNotBlank(artifactPath)) {
//            fileList = this.mlflowClient.listArtifacts(uuid, artifactPath);
//        } else {
//            fileList = this.mlflowClient.listArtifacts(uuid);
//        }
//
//        return fileList.stream().map(ModelEntity.FileInfo::new).collect(Collectors.toList());

        RestTemplate restTemplate = new RestTemplate();

        String url = System.getenv("MLFLOW_TRACKING_URI") + "/api/2.0/preview/mlflow/artifacts/list?run_uuid=" + uuid;
        if (StringUtils.isNotBlank(artifactPath)) {
            url += "&path=" + artifactPath;
        }

        Object restResponse;
        try {
            restResponse = restTemplate.getForObject(url, Object.class);
        } catch (Exception e) {
            throw new ResourceNotFoundException("resource does not exist", e);
        }

        JSONObject json = (JSONObject) JSONObject.toJSON(restResponse);
        JSONArray array = json.getJSONArray("files");
        List<ModelEntity.FileInfo> response = new ArrayList<>();
        if (array != null && array.size() > 0) {
            response = new ArrayList<>(array.size());
            for (Object map : array) {
                JSONObject jsonFileInfo = (JSONObject) map;
                ModelEntity.FileInfo fileInfo = new ModelEntity.FileInfo();
                fileInfo.setDir(jsonFileInfo.getBoolean("is_dir"));
                fileInfo.setPath(jsonFileInfo.getString("path"));
                if (!fileInfo.isDir()) {
                    fileInfo.setFileSize(jsonFileInfo.getLong("file_size"));
                }
                response.add(fileInfo);
            }
        }
        return response;
    }

    public String getModelPath(int experimentId, String uuid) {
        List<ModelEntity.FileInfo> fileInfoList = null;
        List<ModelEntity.FileInfo> tempList = getArtifacts(experimentId, uuid, null);
        while (tempList.size() == 1 && tempList.get(0).isDir()) {
            fileInfoList = tempList;
            tempList = getArtifacts(experimentId, uuid, tempList.get(0).getPath());
        }
        if (fileInfoList == null) {
            throw new ResourceNotFoundException("resource does not exist");
        }
        return fileInfoList.get(0).getPath();
    }

    public int downloadFile(int experimentId, String uuid, String artifactFilePath, HttpServletResponse resonse) throws IOException {
        File file = this.mlflowClient.downloadArtifacts(uuid, artifactFilePath);
        if (file.isDirectory()) {
            throw new IOException("not support download folder");
        }

        String mineType = servletContext.getMimeType(file.getName());
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(mineType);
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        resonse.setContentType(mediaType.getType());
        resonse.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment;filename=" + file.getName());
        resonse.setContentLength((int) file.length());

        try (BufferedInputStream inStream = new BufferedInputStream(new FileInputStream(file)); BufferedOutputStream outStream = new BufferedOutputStream(resonse.getOutputStream())) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = inStream.read(buffer)) != -1) {
                outStream.write(buffer, 0, bytesRead);
            }
            outStream.flush();
        }
        return 0;
    }

    public List<ModelEntity.Param> listParams(int experimentId, String uuid) {
        return listParams(this.mlflowClient.getRun(uuid));
    }

    private List<ModelEntity.Param> listParams(org.mlflow.api.proto.Service.Run run) {
        return run.getData().getParamsList().
                stream().map(ModelEntity.Param::new).collect(Collectors.toList());
    }

    public List<ModelEntity.Metric> listMetrics(int experimentId, String uuid) {
        return listMetrics(this.mlflowClient.getRun(uuid));
    }

    private List<ModelEntity.Metric> listMetrics(org.mlflow.api.proto.Service.Run run) {
        return run.getData().getMetricsList().stream().map(ModelEntity.Metric::new).collect(Collectors.toList());
    }

    public List<ModelEntity.RunTag> listTags(int experimentId, String uuid) {
        return listTags(this.mlflowClient.getRun(uuid));
    }

    private List<ModelEntity.RunTag> listTags(org.mlflow.api.proto.Service.Run run) {
        return run.getData().getTagsList().stream().map(ModelEntity.RunTag::new).collect(Collectors.toList());
    }
}
