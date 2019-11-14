package com.rakuten.tech.dscp.launchpad.controller;

import com.rakuten.tech.dscp.launchpad.entity.ExperimentEntity;
import com.rakuten.tech.dscp.launchpad.entity.PageForm;
import com.rakuten.tech.dscp.launchpad.entity.RunInfoEntity;
import com.rakuten.tech.dscp.launchpad.service.ModelService;
import com.github.pagehelper.Page;
import com.google.common.collect.Lists;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModelControllerTest {

    @Mock
    private ModelService modelService;

    @InjectMocks
    private ModelController modelController;

    @Test
    void listExperiment() {
        when(modelService.listExperiment("")).thenReturn(new Page<>());
        assertNotNull(modelController.listModels("", new PageForm()).getData());
    }

    @Test
    void getExperiment() {
        when(modelService.getExperiment(anyInt())).thenReturn(new ExperimentEntity());
        assertNotNull(modelController.getModelInfo(0));
    }

    @ParameterizedTest
    @ValueSource(ints = {0})
    void deleteExperiment(int id) {
        when(modelService.deleteExperiment(id, true)).thenReturn(id);
        assertEquals(id, modelController.deleteModel(id).getData());
    }

    @Test
    void listRunInfo() {
        when(modelService.listRunInfo(anyInt())).thenReturn(Lists.newArrayList(new RunInfoEntity()));
        assertEquals(1, ((List) modelController.listVersions(0).getData()).size());
    }

    @Test
    void getRunInfo() {
        when(modelService.getRunInfo(anyInt(), anyString())).thenReturn(null);
        assertNull(modelController.getVersionInfo(0, "").getData());
    }

    @ParameterizedTest
    @ValueSource(strings = {"test"})
    void deleteRunInfo(String uuid) {
        when(modelService.deleteRunInfo(anyInt(), uuid, true)).thenReturn(uuid);
        assertEquals(uuid, modelController.deleteVersion(0, uuid).getData());
    }

    @Test
    void getArtifacts() {
        when(modelService.getArtifacts(anyInt(), anyString(), anyString())).thenReturn(new ArrayList<>());
        assertEquals(0, ((List) modelController.getArtifacts(0, "", "").getData()).size());
    }

    @Test
    void getModelPath() {
        String resultStr = "path";
        when(modelService.getModelPath(anyInt(), anyString())).thenReturn(resultStr);
        assertEquals(resultStr, modelController.getModelPath(0, "").getData());
    }

    @Test
    void downloadFile() throws IOException {
        doThrow(new IOException()).when(modelService).downloadFile(anyInt(), anyString(), anyString(), any());
        assertThrows(Exception.class, () -> modelService.downloadFile(0, "", "", null));
    }
}
