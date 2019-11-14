package com.rakuten.tech.dscp.launchpad.dao;

import com.github.pagehelper.Page;
import com.rakuten.tech.dscp.launchpad.entity.ExperimentEntity;
import com.rakuten.tech.dscp.launchpad.entity.mlflow.Experiment;
import com.rakuten.tech.dscp.launchpad.entity.mlflow.FatRun;
import com.rakuten.tech.dscp.launchpad.entity.mlflow.Run;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ModelMgtMapper {

    Page<ExperimentEntity> selectAllExperiment(@Param("keyword") String keyword);

    List<FatRun> selectAllRunDetail(int experimentId);

    void deleteExperiment(int experimentId);

    List<String> selectRunUuid(int experimentId);

    void deleteRunFromVersions(String runUuid);

    void deleteRunFromTags(String runUuid);

    void deleteRunFromParams(String runUuid);

    void deleteRunFromMetrics(String runUuid);

    void deleteRunFromRuns(String runUuid);

    Experiment selectExperiment(int experimentId);

    Run selectRun(String runUuid);

    void setupRunVersion();

    void removeRunVersion();
}
