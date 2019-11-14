package com.rakuten.tech.dscp.launchpad.controller;

import com.alibaba.fastjson.JSONObject;
import com.rakuten.tech.dscp.launchpad.service.ApiService;
import com.rakuten.tech.dscp.launchpad.entity.PredictApiEntity;
import com.rakuten.tech.dscp.launchpad.entity.PredictApiVO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ApiControllerTest {

    private ApiService apiService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        apiService = mock(ApiService.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new ApiController(apiService)).build();
    }

    @Test
    void add() throws Exception {
        when(apiService.createOrReplaceApi(any(PredictApiVO.class), true)).thenReturn(new PredictApiEntity());

        JSONObject json = new JSONObject();

        json.put("apiName", "tt");
        json.put("apiVersion", "2");
        json.put("runId", "b25fcf77d5bb4e669a5fbd1e872a3bac");
        json.put("modelPath", "modelPath");
        json.put("apiPath", "/tt");
        json.put("username", "sipeng.zhiu");
        mockMvc.perform(post("/v1/api").contentType(MediaType.APPLICATION_JSON_UTF8).content(json.toString())).andExpect(status().isOk());
    }

    @Test
    void update() throws Exception {
        when(apiService.createOrReplaceApi(any(PredictApiVO.class), false)).thenReturn(new PredictApiEntity());

        JSONObject json = new JSONObject();

        json.put("apiName", "tt");
        json.put("apiVersion", "2");
        json.put("runId", "b25fcf77d5bb4e669a5fbd1e872a3bac");
        json.put("modelPath", "modelPath");
        json.put("apiPath", "/tt");
        json.put("username", "sipeng.zhiu");
        mockMvc.perform(put("/v1/api").contentType(MediaType.APPLICATION_JSON_UTF8).content(json.toString())).andExpect(status().isOk());
    }

    @Test
    void delete() throws Exception {
        this.mockMvc.perform(MockMvcRequestBuilders.delete("/v1/api", "11").param("apiName", "tt").param("apiVersion", "2")).andExpect(status().isOk());
    }
}
