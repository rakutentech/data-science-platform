package com.rakuten.tech.dscp.launchpad.service;

import com.google.common.collect.Lists;
import com.rakuten.tech.dscp.launchpad.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.mlflow.api.proto.Service;
import org.mlflow.tracking.MlflowClient;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletResponse;

import javax.servlet.ServletContext;
import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModelServiceTest {

    @Mock
    private MlflowClient mlflowClient;

    @Mock
    private ServletContext servletContext;

    @InjectMocks
    private ModelService modelService;

    @Test
    void listExperiment() {
        when(mlflowClient.listExperiments()).thenReturn(null);
        assertThrows(Exception.class, () -> modelService.listExperiment(""));

        when(mlflowClient.listExperiments()).thenReturn(new ArrayList<>());
        assertEquals(0, modelService.listExperiment("").size());

        List<Service.Experiment> result = new ArrayList<>();
        result.add(Service.Experiment.getDefaultInstance());
        result.add(Service.Experiment.getDefaultInstance());
        result.add(Service.Experiment.getDefaultInstance());
        result.add(Service.Experiment.getDefaultInstance());
        when(mlflowClient.listExperiments()).thenReturn(result);
        assertEquals(4, modelService.listExperiment("").size());
    }

    @ParameterizedTest
    @ValueSource(ints = {-1, 0, 1})
    void getExperiment(int id) {
        when(mlflowClient.getExperiment(String.valueOf(id))).then(invocation -> {
            if (id == -2) {
                throw new NullPointerException();
            } else if (id == -1) {
                return null;
            } else {
                return Service.GetExperiment.Response.getDefaultInstance();
            }
        });

        if (id == -2) {
            assertThrows(ResourceNotFoundException.class, () -> modelService.getExperiment(id));
        } else if (id == -1) {
            assertNull(modelService.getExperiment(id));
        } else {
            assertNotNull(modelService.getExperiment(id));
        }
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 1})
    void deleteExperiment(int id) {
        doNothing().when(mlflowClient).deleteExperiment(String.valueOf(id));
        assertEquals(id, modelService.deleteExperiment(id, true));
    }

    @Test
    void listRunInfo() {
        when(mlflowClient.listRunInfos(anyString())).thenReturn(new ArrayList<>());
        assertEquals(0, modelService.listRunInfo(0).size());

        when(mlflowClient.listRunInfos(anyString())).thenReturn(Lists.newArrayList(Service.RunInfo.getDefaultInstance()));
        when(mlflowClient.getRun(anyString())).thenReturn(Service.Run.getDefaultInstance());

        assertEquals(1, modelService.listRunInfo(0).size());
    }

    @ParameterizedTest
    @CsvSource({"0, abc", "1, def"})
    void getRunInfo(int id, String uuid) {
        when(mlflowClient.getRun(anyString())).thenReturn(Service.Run.getDefaultInstance());
        assertNotNull(modelService.getRunInfo(id, uuid));
    }

    @ParameterizedTest
    @ValueSource(strings = {"test"})
    void deleteRunInfo(String uuid) {
        doNothing().when(mlflowClient).deleteRun(uuid);
        assertEquals(uuid, modelService.deleteRunInfo(0, uuid, true));
    }

    @ParameterizedTest
    @CsvSource({"0, abc, ", "1, def, model"})
    void getArtifacts(int id, String uuid, String artifactPath) {
        if (artifactPath == null) {
            lenient().when(mlflowClient.listArtifacts(uuid)).thenReturn(new ArrayList<>());
            assertThrows(ResourceNotFoundException.class, () -> modelService.getArtifacts(id, uuid, artifactPath));
        } else {
            lenient().when(mlflowClient.listArtifacts(uuid, artifactPath)).thenReturn(Lists.newArrayList(Service.FileInfo.getDefaultInstance()));
//            assertEquals(1, modelService.getArtifacts(id, uuid, artifactPath).size());
            assertThrows(ResourceNotFoundException.class, () -> modelService.getArtifacts(id, uuid, artifactPath));
        }
    }

    @ParameterizedTest
    @CsvSource({"0, abc", "1, def"})
    void getModelPath(int id, String uuid) {
        lenient().when(mlflowClient.listArtifacts(uuid)).thenReturn(Lists.newArrayList(Service.FileInfo.getDefaultInstance()));

        assertThrows(ResourceNotFoundException.class, () -> modelService.getModelPath(id, uuid));
//        doNothing().when(modelService.getModelPath(id, uuid));

    }

    @ParameterizedTest
    @CsvSource({"0, abc", "1, def"})
    void listParams(int id, String uuid) {
        when(mlflowClient.getRun(uuid)).thenReturn(Service.Run.getDefaultInstance());
        assertEquals(0, modelService.listParams(id, uuid).size());
    }

    @ParameterizedTest
    @CsvSource({"0, abc", "1, def"})
    void listMetrics(int id, String uuid) {
        when(mlflowClient.getRun(uuid)).thenReturn(Service.Run.getDefaultInstance());
        assertEquals(0, modelService.listMetrics(id, uuid).size());
    }

    @ParameterizedTest
    @CsvSource({"0, abc", "1, def"})
    void listTags(int id, String uuid) {
        when(mlflowClient.getRun(uuid)).thenReturn(Service.Run.getDefaultInstance());
        assertEquals(0, modelService.listTags(id, uuid).size());
    }

//
//    @Mock
//    MockHttpServletResponse response;
//
//    @Mock
//    ModelService modelService2;

    @ParameterizedTest
    @CsvSource({"0, abc, /tmp", "1, def, /etc/hosts"})
    void downloadFile(int id, String uuid, String artifactFilePath) throws IOException {
        when(mlflowClient.downloadArtifacts(uuid, artifactFilePath)).thenReturn(new File(artifactFilePath));

        if (id == 0) {
            assertThrows(IOException.class, () -> modelService.downloadFile(id, uuid, artifactFilePath, null));
        } else {
            lenient().when(servletContext.getMimeType(anyString())).thenReturn("*.*");
            MockHttpServletResponse response = new MockHttpServletResponse();
//            doNothing().when(modelService2).downloadFile(id, uuid, artifactFilePath, response);
            assertEquals(0, modelService.downloadFile(id, uuid, artifactFilePath, response));
        }

    }


}
