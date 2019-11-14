package com.rakuten.tech.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rakuten.tech.config.DefaultProxySelector;
import com.rakuten.tech.controller.NotebookController;
import com.rakuten.tech.model.PublishParameter;
import com.rakuten.tech.nbconvert.ExecuteResult;
import com.rakuten.tech.service.NotebookService;

@RunWith(SpringRunner.class)
@WebMvcTest(NotebookController.class)
@AutoConfigureMockMvc(secure = false)
public class NotebookControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@MockBean
	private NotebookService notebookService;

	@MockBean
	private DefaultProxySelector proxySelector;

	private final String SERVICE_URI = "/kh/v1";

	private final String AUTHOR_ID = "test.id";

	private final String AUTHOR_ANME = "tester";

	private final String NOTEBOOK_ID = "notebook.id";

	private final String COMMENT_ID = "comment.id";

	private ObjectMapper mapper = new ObjectMapper();

	@Test
	public void testGetNotebooks() throws Exception {
		this.mockMvc.perform(get(SERVICE_URI + "/notebooks")).andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testSearchNotebooks() throws Exception {
		this.mockMvc.perform(get(SERVICE_URI + "/notebooks/search")).andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testGetAuthor() throws Exception {
		this.mockMvc.perform(get(SERVICE_URI + "/authors?authorId=" + AUTHOR_ID + "&authorName=" + AUTHOR_ANME))
				.andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testGetNotebookDetail() throws Exception {
		this.mockMvc.perform(get(SERVICE_URI + "/notebooks/" + NOTEBOOK_ID + "?recordStatus=0"))
				.andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testGetPopulatedNotebooks() throws Exception {
		this.mockMvc.perform(get(SERVICE_URI + "/populatedNotebooks?limit=10")).andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testGetPopulatedTags() throws Exception {
		this.mockMvc.perform(get(SERVICE_URI + "/populatedTags?limit=10")).andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testGetAuthors() throws Exception {
		this.mockMvc.perform(get(SERVICE_URI + "/authors")).andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testGetTags() throws Exception {
		this.mockMvc.perform(get(SERVICE_URI + "/tags")).andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testGetFile() throws Exception {
		this.mockMvc.perform(get(SERVICE_URI + "/files?filePath=/test")).andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testPreviewNotebook() throws Exception {
		Mockito.when(notebookService.saveFile(ArgumentMatchers.any(), ArgumentMatchers.any()))
				.thenReturn(new ExecuteResult(0, null));
		MockMultipartFile notebookFile = new MockMultipartFile("notebookFile", "notebookFile.ipynb", "text/plain",
				"some ipynb".getBytes());
		MockHttpServletRequestBuilder builder = MockMvcRequestBuilders
				.multipart(SERVICE_URI + "/notebooks/" + NOTEBOOK_ID).file(notebookFile)
				.content(mapper.writeValueAsString(new PublishParameter()));
		this.mockMvc.perform(builder).andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testCreateComment() throws Exception {
		this.mockMvc.perform(post(SERVICE_URI + "/notebooks/" + NOTEBOOK_ID + "/comments?userId=test&userName=tester")
				.content("test comment")).andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testCreateAuthor() throws Exception {
		this.mockMvc.perform(post(SERVICE_URI + "/authors?authorIds=1,2,3&authorNames=a,b,c"))
				.andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testPublishNotebook() throws Exception {
		this.mockMvc
				.perform(put(SERVICE_URI + "/notebooks/" + NOTEBOOK_ID)
						.content(mapper.writeValueAsString(new PublishParameter())))
				.andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testUpdateNotebook() throws Exception {
		this.mockMvc
				.perform(patch(SERVICE_URI + "/notebooks/" + NOTEBOOK_ID)
						.content(mapper.writeValueAsString(new PublishParameter())))
				.andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testUpdateNotification() throws Exception {
		this.mockMvc.perform(put(SERVICE_URI + "/notifications/" + AUTHOR_ID + "?postNotif=true&commentNotif=false"))
				.andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testUpdateComment() throws Exception {
		this.mockMvc
				.perform(put(SERVICE_URI + "/notebooks/" + NOTEBOOK_ID + "/comments/" + COMMENT_ID
						+ "?userId=test&userName=tester").content("test content"))
				.andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testUpdatePageViewCount() throws Exception {
		this.mockMvc.perform(put(SERVICE_URI + "/notebooks/" + NOTEBOOK_ID + "/pageView"))
				.andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testDeleteNotebook() throws Exception {
		this.mockMvc
				.perform(delete(SERVICE_URI + "/notebooks/" + NOTEBOOK_ID)
						.content(mapper.writeValueAsString(new PublishParameter())))
				.andExpect(status().is2xxSuccessful());
	}

	@Test
	public void testDeleteComment() throws Exception {
		this.mockMvc
				.perform(delete(SERVICE_URI + "/notebooks/" + NOTEBOOK_ID + "/comments/" + COMMENT_ID + "?userId=test"))
				.andExpect(status().is2xxSuccessful());
	}

}
