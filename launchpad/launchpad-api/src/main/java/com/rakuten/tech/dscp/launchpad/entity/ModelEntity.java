package com.rakuten.tech.dscp.launchpad.entity;

import lombok.Data;

@Data
public class ModelEntity {

    private String id;

    private String uuid;

    private String path;

    @Data
    public static final class Param {

        private String key;

        private String value;

        public Param() {
        }

        public Param(org.mlflow.api.proto.Service.Param mlflowParam) {
            this.key = mlflowParam.getKey();
            this.value = mlflowParam.getValue();
        }
    }

    @Data
    public static final class Metric {

        private String key;

        private double value;

        private long timestamp;

        public Metric() {
        }

        public Metric(org.mlflow.api.proto.Service.Metric mlflowMetric) {
            this.key = mlflowMetric.getKey();
            this.value = mlflowMetric.getValue();
            this.timestamp = mlflowMetric.getTimestamp();
        }
    }

    @Data
    public static final class RunTag {

        private String key;

        private String value;

        public RunTag() {
        }

        public RunTag(org.mlflow.api.proto.Service.RunTag mlflowRunTag) {
            this.key = mlflowRunTag.getKey();
            this.value = mlflowRunTag.getValue();
        }
    }

    @Data
    public static final class FileInfo {

        private String path;

        private boolean isDir;

        private long fileSize;

        public FileInfo() {
        }

        public FileInfo(org.mlflow.api.proto.Service.FileInfo mlflowFileInfo) {
            this.path = mlflowFileInfo.getPath();
            this.isDir = mlflowFileInfo.getIsDir();
            this.fileSize = mlflowFileInfo.getFileSize();
        }
    }
}
