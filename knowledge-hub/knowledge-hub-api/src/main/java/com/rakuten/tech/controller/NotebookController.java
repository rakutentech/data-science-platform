package com.rakuten.tech.controller;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rakuten.tech.constants.CommonConstants;
import com.rakuten.tech.constants.CommonConstants.SEARCH_CATEGORY;
import com.rakuten.tech.convert.EntityConverter;
import com.rakuten.tech.dto.ApiResponseEntity;
import com.rakuten.tech.entity.KhAuthor;
import com.rakuten.tech.entity.KhNotebook;
import com.rakuten.tech.exception.KhException;
import com.rakuten.tech.exception.PrivilegeException;
import com.rakuten.tech.model.NotebookListCondition;
import com.rakuten.tech.model.NotebookListResponse;
import com.rakuten.tech.model.PublishParameter;
import com.rakuten.tech.nbconvert.ExecuteResult;
import com.rakuten.tech.service.NotebookService;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Knowledge Hub API Controller
 * 
 * @author chienchang.a.huang
 */
@RestController
@AllArgsConstructor
@RequestMapping(path = "/kh/v1")
@Api(tags = "Notebook APIs")
@Slf4j(topic = "NotebookController")
public class NotebookController {

	private NotebookService notebookService;

	/**
	 * Get notebook list
	 * 
	 * @param notebookListConditions- query conditions
	 * @return ApiResponseEntity API Response
	 */
	@GetMapping(path = "/notebooks")
	@ApiOperation(value = "Get Notebook List", tags = "v1")
	public ApiResponseEntity getNotebooks(NotebookListCondition notebookListConditions) {

		Page<KhNotebook> dataPageInfo = notebookService.getNotebookList(notebookListConditions);
		if (dataPageInfo == null || CollectionUtils.isEmpty(dataPageInfo.getContent())) {
			return new ApiResponseEntity(CommonConstants.MESSAGE_DATA_NOT_FOUND);
		}
		NotebookListResponse notebookListResponses = EntityConverter.convertToNotebookList(dataPageInfo);
		return new ApiResponseEntity(notebookListResponses);
	}

	/**
	 * Search notebook list
	 * 
	 * @param notebookListConditions- search conditions
	 * @return ApiResponseEntity API Response
	 */
	@GetMapping(path = "/notebooks/search")
	@ApiOperation(value = "Search Notebook List", tags = "v1")
	public ApiResponseEntity searchNotebooks(@RequestParam(value = "searchType", required = false) String searchType,
			NotebookListCondition notebookListConditions) {

		Page<KhNotebook> dataPageInfo = null;
		if (StringUtils.isBlank(searchType)) {
			dataPageInfo = notebookService.searchNotebookList(notebookListConditions);

		} else if (searchType.toUpperCase().equals(SEARCH_CATEGORY.TAG.name())) {
			dataPageInfo = notebookService.searchNotebook(notebookListConditions, SEARCH_CATEGORY.TAG);

		} else if (searchType.toUpperCase().equals(SEARCH_CATEGORY.AUTHOR.name())) {
			dataPageInfo = notebookService.searchNotebook(notebookListConditions, SEARCH_CATEGORY.AUTHOR);

		}

		if (dataPageInfo == null || CollectionUtils.isEmpty(dataPageInfo.getContent())) {
			return new ApiResponseEntity(CommonConstants.MESSAGE_DATA_NOT_FOUND);
		}

		NotebookListResponse notebookListResponses = EntityConverter.convertToNotebookList(dataPageInfo);
		return new ApiResponseEntity(notebookListResponses);
	}

	/**
	 * Get notebook detail
	 * 
	 * @param notebook id
	 * @param record   status
	 * @return ApiResponseEntity API Response
	 */
	@GetMapping(path = "/notebooks/{notebookId}")
	@ApiOperation(value = "Get Notebook Detail", tags = "v1")
	public ApiResponseEntity getNotebookDetail(@PathVariable(value = "notebookId") String notebookId,
			@RequestParam(value = "recordStatus", required = true) String status) {

		KhNotebook notebook = null;
		if (status.equals(CommonConstants.RECORD_STATUS_PREVIEW)) {
			notebook = notebookService.getNotebookPreviewDetail(notebookId);

		} else if (status.equals(CommonConstants.RECORD_STATUS_PUBLISH)) {
			notebook = notebookService.getNotebookDetail(notebookId);
		}

		if (notebook == null) {
			return new ApiResponseEntity(CommonConstants.MESSAGE_DATA_NOT_FOUND);
		} else {
			return new ApiResponseEntity(notebook);
		}
	}

	/**
	 * Get popular notebooks
	 * 
	 * @param list size
	 * @return ApiResponseEntity API Response
	 */
	@GetMapping(path = "/populatedNotebooks")
	@ResponseBody
	@ApiOperation(value = "Get populated notebook list", tags = "v1")
	public ApiResponseEntity getPopulatedNotebooks(@RequestParam(value = "limit", required = true) Integer limit) {
		List<KhNotebook> nbList = notebookService.getPopulatedNotebooks(limit);
		if (nbList == null) {
			return new ApiResponseEntity(CommonConstants.MESSAGE_DATA_NOT_FOUND);
		} else {
			return new ApiResponseEntity(nbList);
		}
	}

	/**
	 * Get popular tags
	 * 
	 * @param list size
	 * @return ApiResponseEntity API Response
	 */
	@GetMapping(path = "/populatedTags")
	@ResponseBody
	@ApiOperation(value = "Get populated tag list", tags = "v1")
	public ApiResponseEntity getPopulatedTags(@RequestParam(value = "limit", required = true) Integer limit) {
		return new ApiResponseEntity(notebookService.getPopulatedTags(limit));
	}

	/**
	 * Get authors
	 * 
	 * @return ApiResponseEntity API Response
	 */
	@GetMapping(path = "/authors")
	@ResponseBody
	@ApiOperation(value = "Get author", tags = "v1")
	public ApiResponseEntity getAuthors(@RequestParam(value = "authorId", required = false) String authorId,
			@RequestParam(value = "authorName", required = false) String authorName) {

		if (StringUtils.isBlank(authorId) && StringUtils.isBlank(authorName)) {
			return new ApiResponseEntity(notebookService.getAllAuthors());
			
		} else {
			KhAuthor author = notebookService.getAuthorInfo(authorId, authorName);
			if (author == null) {
				return new ApiResponseEntity(CommonConstants.MESSAGE_DATA_NOT_FOUND);
			} else {
				return new ApiResponseEntity(author);
			}
		}
	}

	/**
	 * Get tags
	 * 
	 * @return ApiResponseEntity API Response
	 */
	@GetMapping(path = "/tags")
	@ResponseBody
	@ApiOperation(value = "Get tag list", tags = "v1")
	public ApiResponseEntity getTags() {
		return new ApiResponseEntity(notebookService.getAllTags());
	}

	/**
	 * Get file
	 * 
	 * @param file path
	 * @return io resource
	 */
	@GetMapping(path = "/files")
	@ApiOperation(value = "download File", tags = "v1")
	public ResponseEntity<Resource> getFile(@RequestParam(value = "filePath", required = true) String filePath)
			throws IOException {

		File file = new File(filePath);

		System.out.println(new File("/test.txt").getAbsoluteFile().getAbsolutePath());
		
		log.info("read file from [{}] and file is existed [{}]", filePath, file.exists());
		if (file.exists()) {
			ByteArrayResource resource = new ByteArrayResource(Files.readAllBytes(Paths.get(filePath)));
			String extension = file.getName().substring(file.getName().lastIndexOf(".") + 1);
			if (extension.equalsIgnoreCase(CommonConstants.FILE_EXTENSION_SVG)) {
				return ResponseEntity.ok().contentLength(file.length())
						.contentType(MediaType.parseMediaType("image/svg+xml")).body(resource);
			} else if (extension.equalsIgnoreCase(CommonConstants.FILE_EXTENSION_NOTEBOOK)) {
				HttpHeaders responseHeaders = new HttpHeaders();
				responseHeaders.set("Content-disposition", "attachment; filename=" + file.getName());
				return ResponseEntity.ok().contentLength(file.length())
						.contentType(MediaType.parseMediaType("text/html")).headers(responseHeaders).body(resource);
			} else {
				return ResponseEntity.ok().contentLength(file.length())
						.contentType(MediaType.parseMediaType("application/octet-stream")).body(resource);
			}
		} else {
			return null;
		}
	}

	/**
	 * Preview notebook
	 * 
	 * @param notebook file
	 * @param publish  parameters
	 * @return ApiResponseEntity API Response
	 * @throws Exception
	 */
	@PostMapping(path = "/notebooks/{notebookId}")
	@ResponseBody
	@ApiOperation(value = "Preview Notebook", tags = "v1")
	public ApiResponseEntity previewNotebook(@PathVariable(value = "notebookId") String notebookId,
			@RequestParam(value = "notebookFile", required = true) MultipartFile notebookFile,
			PublishParameter inputParameter) throws Exception {

		log.info("Input =>" + new ObjectMapper().writeValueAsString(inputParameter));
		ExecuteResult result = null;
		if (StringUtils.isBlank(inputParameter.getNotebookId())) {
			return new ApiResponseEntity(CommonConstants.MESSAGE_WITHOUT_NOTEBOOK_ID);
		}

		if (notebookFile != null && !notebookFile.isEmpty()) {
			result = notebookService.saveFile(inputParameter, notebookFile);
		} else {
			return new ApiResponseEntity(CommonConstants.MESSAGE_WITHOUT_NOTEBOOK_FILE);
		}

		if (result.getExitCode() == 0) {
			inputParameter.setRecordStatus(CommonConstants.RECORD_STATUS_PREVIEW);
			notebookService.saveKhNotebook(inputParameter, result.getExecuteOut());
			return new ApiResponseEntity(CommonConstants.MESSAGE_PREVIEW_SUCCESS);
		} else {
			return new ApiResponseEntity(result.getExecuteOut());
		}
	}

	/**
	 * Create comment
	 * 
	 * @param notebook id
	 * @param user     id
	 * @param user     name
	 * @param comment
	 * @return ApiResponseEntity API Response
	 */
	@PostMapping(path = "/notebooks/{notebookId}/comments")
	@ResponseBody
	@ApiOperation(value = "Create Comment", tags = "v1")
	public ApiResponseEntity createComment(@PathVariable(value = "notebookId") String notebookId,
			@RequestParam(value = "userId") String userId, @RequestParam(value = "userName") String userName,
			@RequestBody String comment) {
		notebookService.insertComment(notebookId, userId, userName, comment);
		return new ApiResponseEntity(CommonConstants.MESSAGE_PUBLISH_SUCCESS);
	}

	/**
	 * Create authors
	 * 
	 * @param autor  ids
	 * @param author names
	 * @return ApiResponseEntity API Response
	 * @throws Exception
	 */
	@PostMapping(path = "/authors")
	@ResponseBody
	@ApiOperation(value = "Create authors", tags = "v1")
	public ApiResponseEntity createAuthor(@RequestParam(value = "authorIds", required = true) List<String> authorIds,
			@RequestParam(value = "authorNames", required = true) List<String> authorNames) throws Exception {
		try {
			if (authorIds.size() != authorNames.size()) {
				throw new Exception("Author Ids can't match Author Names");
			}
			for (int i = 0; i < authorIds.size(); i++) {
				notebookService.saveAuthorInfo(authorIds.get(i), authorNames.get(i));
			}
			return new ApiResponseEntity(CommonConstants.MESSAGE_PUBLISH_SUCCESS);
		} catch (Exception e) {
			log.warn(e.getMessage(), e);
			return new ApiResponseEntity(e.getMessage());
		}
	}

	/**
	 * Publish notebook
	 * 
	 * @param notebook id
	 * @param publish  parameters
	 * @return ApiResponseEntity API Response
	 * @throws Exception
	 */
	@PutMapping(path = "/notebooks/{notebookId}")
	@ApiOperation(value = "Publish Notebook", tags = "v1")
	public ApiResponseEntity publishNotebook(@PathVariable(value = "notebookId") String notebookId,
			PublishParameter publishParameter, HttpServletRequest request) throws Exception {

		if (StringUtils.isNoneBlank(notebookId)) {
			publishParameter.setNotebookId(notebookId);
		}
		log.info("Input =>" + new ObjectMapper().writeValueAsString(publishParameter));

		try {
			boolean result = notebookService.publishNotebook(publishParameter, request.getHeader("userId"));
			return new ApiResponseEntity(
					result ? CommonConstants.MESSAGE_PUBLISH_SUCCESS : CommonConstants.MESSAGE_DATA_NOT_FOUND);
		} catch (PrivilegeException e) {
			log.warn(e.getMessage(), e);
			return new ApiResponseEntity(e.getMessage());
		} catch (KhException e) {
			log.warn(e.getMessage(), e);
			return new ApiResponseEntity(e.getMessage());
		}
	}

	/**
	 * Update notebook meta data
	 * 
	 * @param publish parameters
	 * @return ApiResponseEntity API Response
	 * @throws Exception
	 */
	@PatchMapping(path = "/notebooks/{notebookId}")
	@ApiOperation(value = "Update Notebook", tags = "v1")
	public ApiResponseEntity updateNotebook(@PathVariable(value = "notebookId") String notebookId,
			PublishParameter publishParameter, HttpServletRequest request) throws Exception {
		try {
			boolean result = notebookService.updateRecord(publishParameter, request.getHeader("userId"));
			return new ApiResponseEntity(
					result ? CommonConstants.MESSAGE_UPDATE_SUCCESS : CommonConstants.MESSAGE_DATA_NOT_FOUND);
		} catch (KhException e) {
			log.warn(e.getMessage(), e);
			return new ApiResponseEntity(e.getMessage());
		} catch (PrivilegeException e) {
			log.warn(e.getMessage(), e);
			return new ApiResponseEntity(e.getMessage());
		}
	}

	/**
	 * Update notification setting
	 * 
	 * @param autor   id
	 * @param post    notification flag
	 * @param comment notification flag
	 * @return ApiResponseEntity API Response
	 * @throws Exception
	 */
	@PutMapping(path = "/notifications/{authorId}")
	@ResponseBody
	@ApiOperation(value = "Update Notification", tags = "v1")
	public ApiResponseEntity updateNotification(@PathVariable(value = "authorId") String authorId,
			@RequestParam(value = "postNotif", required = true) boolean postNotif,
			@RequestParam(value = "commentNotif", required = true) boolean commentNotif) throws Exception {
		try {
			notebookService.updteNotificationSetting(authorId, postNotif, commentNotif);
			return new ApiResponseEntity(CommonConstants.MESSAGE_UPDATE_SUCCESS);
		} catch (Exception e) {
			log.warn(e.getMessage(), e);
			return new ApiResponseEntity(e.getMessage());
		}
	}

	/**
	 * Update comment
	 * 
	 * @param comment id
	 * @param user    id
	 * @param user    name
	 * @param comment
	 * @return ApiResponseEntity API Response
	 * @throws PrivilegeException
	 */
	@PutMapping(path = "/notebooks/{notebookId}/comments/{commentId}")
	@ResponseBody
	@ApiOperation(value = "Update Comment", tags = "v1")
	public ApiResponseEntity updateComment(@PathVariable(value = "notebookId", required = true) String notebookId,
			@PathVariable(value = "commentId", required = true) String commentId,
			@RequestParam(value = "userId") String userId, @RequestParam(value = "userName") String userName,
			@RequestBody String comment) throws PrivilegeException {

		try {
			boolean result = notebookService.updateComment(commentId, userId, userName, comment);
			return new ApiResponseEntity(
					result ? CommonConstants.MESSAGE_UPDATE_SUCCESS : CommonConstants.MESSAGE_DATA_NOT_FOUND);
		} catch (PrivilegeException e) {
			log.warn(e.getMessage(), e);
			return new ApiResponseEntity(e.getMessage());
		}
	}

	/**
	 * Update page view count
	 * 
	 * @param notebook id
	 * @return ApiResponseEntity API Response
	 */
	@PutMapping(path = "/notebooks/{notebookId}/pageView")
	@ApiOperation(value = "Update Page View Count", tags = "v1")
	public ApiResponseEntity updatePageViewCount(@PathVariable(value = "notebookId", required = true) String notebookId,
			HttpServletRequest request) {
		notebookService.updateViewCount(notebookId, request.getHeader("userId"), getIpAddr(request));
		return new ApiResponseEntity(CommonConstants.MESSAGE_UPDATE_SUCCESS);
	}

	/**
	 * Delete notebook
	 * 
	 * @param notebook id
	 * @return ApiResponseEntity API Response
	 * @throws Exception
	 */
	@DeleteMapping(path = "/notebooks/{notebookId}")
	@ApiOperation(value = "Delete Notebook", tags = "v1")
	public ApiResponseEntity deleteNotebook(@PathVariable(value = "notebookId") String notebookId,
			HttpServletRequest request) throws Exception {
		try {
			boolean result = notebookService.deleteRecord(notebookId, request.getHeader("userId"));
			return new ApiResponseEntity(
					result ? CommonConstants.MESSAGE_DELETE_SUCCESS : CommonConstants.MESSAGE_DATA_NOT_FOUND);
		} catch (PrivilegeException e) {
			log.warn(e.getMessage(), e);
			return new ApiResponseEntity(e.getMessage());
		}
	}

	/**
	 * Delete comment
	 * 
	 * @param comment id
	 * @param user    id
	 * @param user    name
	 * @param comment
	 * @return ApiResponseEntity API Response
	 * @throws Exception
	 */
	@DeleteMapping(path = "/notebooks/{notebookId}/comments/{commentId}")
	@ApiOperation(value = "Delete comment", tags = "v1")
	public ApiResponseEntity deleteComment(@PathVariable(value = "notebookId", required = true) String notebookId,
			@PathVariable(value = "commentId", required = true) String commentId,
			@RequestParam(value = "userId") String userId) throws Exception {
		try {
			boolean result = notebookService.deleteComment(commentId, userId);
			return new ApiResponseEntity(
					result ? CommonConstants.MESSAGE_DELETE_SUCCESS : CommonConstants.MESSAGE_DATA_NOT_FOUND);
		} catch (PrivilegeException e) {
			log.warn(e.getMessage(), e);
			return new ApiResponseEntity(e.getMessage());
		}
	}

	private String getIpAddr(HttpServletRequest request) {
		String ip = request.getHeader("x-forwarded-for");
		if (StringUtils.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("Proxy-Client-IP");
		}
		if (StringUtils.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getHeader("WL-Proxy-Client-IP");
		}
		if (StringUtils.isBlank(ip) || "unknown".equalsIgnoreCase(ip)) {
			ip = request.getRemoteAddr();
		}
		return ip;
	}

}
