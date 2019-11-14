package com.rakuten.tech.dscp.launchpad.aop;

import com.rakuten.tech.dscp.launchpad.dao.PredictApiMapper;
import com.rakuten.tech.dscp.launchpad.entity.PredictApiEntity;
import com.rakuten.tech.dscp.launchpad.entity.PredictApiVO;
import com.rakuten.tech.dscp.launchpad.service.ApiService;
import com.rakuten.tech.dscp.launchpad.service.SvcService;
import io.fabric8.kubernetes.api.model.Service;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Predict API service Aspect
 *
 * @author Rex
 * @date 2019/08/09
 */

@Aspect
@Component
@Slf4j
public class PredictApiServiceAop {

    private final ApiService apiService;

    private final SvcService svcService;

    private final PredictApiMapper predictApiMapper;

    @Autowired
    public PredictApiServiceAop(ApiService apiService, SvcService svcService, PredictApiMapper predictApiMapper) {
        this.apiService = apiService;
        this.svcService = svcService;
        this.predictApiMapper = predictApiMapper;
    }

    @Pointcut("execution(* com.rakuten.tech.dscp.launchpad.service.ApiService.createOrReplaceApi(..))")
    public void createOrReplaceApiPointcut() {
    }

    @Before("createOrReplaceApiPointcut()")
    public void processBeforeApiCreationAndReplacement(JoinPoint jp) {
        Object[] args = jp.getArgs();
        PredictApiVO predictApiVO = (PredictApiVO) args[0];
        Boolean isCreate = (Boolean) args[1];

        String username = predictApiVO.getUsername();
        String apiVersion = predictApiVO.getApiVersion();
        String resName = apiService.concatApiName(predictApiVO.getApiName(), username, apiVersion);
        String runId = predictApiVO.getRunId();

        int countRunId = predictApiMapper.countByRunId(runId);
        if (isCreate) {
            if (countRunId > 0) {
                throw new IllegalArgumentException("Do not create duplicate predict api for model version: " + runId);
            }
            Service newService = svcService.getService(resName);
            if (newService != null) {
                throw new IllegalArgumentException("Predict api exist");
            }
        } else {
            PredictApiEntity predictApiEntity = predictApiMapper.selectByPrimaryKey(predictApiVO.getId());
            if (predictApiEntity == null) {
                throw new IllegalArgumentException("Predict api doesn't exist");
            }
            if (countRunId > 0 && !StringUtils.equals(runId, predictApiEntity.getRunId())) {
                throw new IllegalArgumentException("Do not create duplicate predict api for model version: " + runId);
            }
        }
    }

}
