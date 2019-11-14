package com.rakuten.tech.dscp.launchpad.dao;

import com.github.pagehelper.Page;
import com.rakuten.tech.dscp.launchpad.entity.PredictApiEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * Created by Mybatis Generator 2019/06/25
 */
@Mapper
public interface PredictApiMapper {
    int insert(PredictApiEntity record);

    int insertSelective(PredictApiEntity record);

    Page<PredictApiEntity> selectAll(@Param("keyword") String keyword);

    PredictApiEntity selectByPrimaryKey(Long id);

    int countByRunId(String runId);

    PredictApiEntity selectByResName(@Param("resName") String resName);

    PredictApiEntity selectByRunId(@Param("runId") String runId);

    int deleteByPrimaryKey(Long id);

    int deleteByResName(@Param("resName") String resName);

    boolean existModelId(Long modelId);

    boolean existRunId(String runId);

    int replace(PredictApiEntity record);
}
