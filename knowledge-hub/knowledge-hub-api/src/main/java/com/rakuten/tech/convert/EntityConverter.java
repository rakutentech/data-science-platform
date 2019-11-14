package com.rakuten.tech.convert;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;

import com.rakuten.tech.entity.KhNotebook;
import com.rakuten.tech.entity.KhNotebook.KhNotebookId;
import com.rakuten.tech.model.NotebookBody;
import com.rakuten.tech.model.NotebookListResponse;
import com.rakuten.tech.model.PublishParameter;
import com.rakuten.tech.util.DateUtil;

/**
 * Entity converter
 * 
 * @author chienchang.a.huang
 */
public class EntityConverter {

	/**
	 * KhNotebook List convert to NotebookBody List.
	 * 
	 * @param dataInfo data page Information
	 * @return NotebookListResponse
	 */
	public static NotebookListResponse convertToNotebookList(Page<KhNotebook> notebookList) {

		NotebookListResponse response = new NotebookListResponse();
		List<NotebookBody> bodylist = new ArrayList<>();
		NotebookBody body = null;

		for (KhNotebook notebook : notebookList.getContent()) {
			body = new NotebookBody();
			body.setNotebookId(notebook.getId().getNotebookId());
			body.setTitle(notebook.getTitle());
			body.setSubTitle(notebook.getSubTitle());
			body.setAuthors(notebook.getAuthors());
			body.setTags(notebook.getTags());	
			body.setPageView(notebook.getPageView());
			body.setKeywords(notebook.getKeywords());
			body.setCommentCount(notebook.getCommentCount());
			
			if (StringUtils.isNotBlank(notebook.getPath())) {
				body.setHtmlUrl(notebook.getPath());
			}
			body.setCreateTime(notebook.getCreateTime());
			body.setUpdatedTime(notebook.getUpdateTime());
			bodylist.add(body);
		}

		response.setKhNotebookBodyList(bodylist);
		response.setTotalCount(notebookList.getTotalElements());
		response.setLimit(notebookList.getSize());
		response.setPageNo(notebookList.getNumber() + 1);
		response.setTotalPages(notebookList.getTotalPages());

		return response;
	}


	/**
	 * Transfer publishParameter to KhNotebookTbl.
	 * 
	 * @param khNotebook publishParameter
	 * @param markdown file path
	 * @return KhNotebook object
	 * @throws ParseException 
	 */
	public static KhNotebook convertToNotebook(PublishParameter publishParameter, String filePath) throws ParseException {
		
		KhNotebookId id = new KhNotebookId();
		id.setNotebookId(publishParameter.getNotebookId());
		id.setRecordStatus(publishParameter.getRecordStatus());
		
		KhNotebook khNotebook = new KhNotebook();
		
		if (StringUtils.isNotBlank(publishParameter.getTitle())) {
			khNotebook.setTitle(publishParameter.getTitle());
		}

		if (StringUtils.isNotBlank(publishParameter.getSubTitle())) {
			khNotebook.setSubTitle(publishParameter.getSubTitle());
		}

		if (StringUtils.isNotBlank(publishParameter.getKeywords())) {
			khNotebook.setKeywords(publishParameter.getKeywords());
		}
		
		if(StringUtils.isNotBlank(publishParameter.getCreateTime())) {
			khNotebook.setCreateTime(DateUtil.stringToDate(publishParameter.getCreateTime()));
		} else {
			khNotebook.setCreateTime(new Date());
		}
		
		if(StringUtils.isNotBlank(publishParameter.getUpdateTime())) {
			khNotebook.setUpdateTime(DateUtil.stringToDate(publishParameter.getUpdateTime()));
		} else {
			khNotebook.setUpdateTime(new Date());
		}
		
		khNotebook.setPath(filePath);
		khNotebook.setId(id);
		
		return khNotebook;
	}

}
