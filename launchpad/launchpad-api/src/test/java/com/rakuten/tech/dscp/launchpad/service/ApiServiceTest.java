package com.rakuten.tech.dscp.launchpad.service;

import com.rakuten.tech.dscp.launchpad.dao.PredictApiMapper;
import com.rakuten.tech.dscp.launchpad.entity.PredictApiEntity;
import com.rakuten.tech.dscp.launchpad.entity.PredictApiVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;

import static org.junit.Assert.assertNotNull;

class ApiServiceTest extends BaseResourceTest {

    @Mock
    PredictApiMapper predictApiMapper;
    private ApiService apiService;

    @BeforeEach
    public void setup() {
        DeploymentService deploymentService = new DeploymentService(kubernetesClient, istioClient);

        SvcService svcService = new SvcService(kubernetesClient, istioClient);

        IngressService ingressService = new IngressService(kubernetesClient, istioClient);

        apiService = new ApiService(deploymentService, svcService, ingressService, predictApiMapper, kubernetesClient, istioClient);
    }

    @Test
    void createApi() {

        PredictApiVO predictApiVO = new PredictApiVO();
        predictApiVO.setApiPath("/tt");
        predictApiVO.setApiName("tt");
        predictApiVO.setApiVersion("v1");
        predictApiVO.setModelPath("modelPath");
        predictApiVO.setRunId("b25fcf77d5bb4e669a5fbd1e872a3bac");
        predictApiVO.setUsername("sipeng.zhu");

        PredictApiEntity str = apiService.createOrReplaceApi(predictApiVO, true);
        assertNotNull(str);
    }

    @Test
    void updateApi() {
        PredictApiVO predictApiVO = new PredictApiVO();
        predictApiVO.setApiPath("/tt");
        predictApiVO.setApiName("tt");
        predictApiVO.setApiVersion("v1");
        predictApiVO.setModelPath("modelPath");
        predictApiVO.setRunId("b25fcf77d5bb4e669a5fbd1e872a3bac");
        predictApiVO.setUsername("sipeng.zhu");

        PredictApiEntity str = apiService.createOrReplaceApi(predictApiVO, false);
        assertNotNull(str);
    }

    @Test
    void deleteApi() {
        String resName = "tt";
        apiService.deleteApi(1L);
    }
}
