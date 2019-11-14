package com.rakuten.tech.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.hibernate.annotations.Proxy;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.rakuten.tech.constants.CommonConstants;

import lombok.Data;

@Entity
@Data
@Table(name = "kh_notebook")
@Proxy(lazy = false)
public class KhNotebook {

	@EmbeddedId
	private KhNotebookId id;

	@Column(name = "notebook_title")
	private String title;

	@Column(name = "notebook_subtitle")
	private String subTitle;

	@Column(name = "keywords")
	private String keywords;

	@Column(name = "create_time")
	private Date createTime;

	@Column(name = "update_time")
	private Date updateTime;
	
	@Column(name = "path")
	private String path;
	
	@Transient
	private String notebookFilePath;

	@Transient
	private String[] authors = {};
	
	@Transient
	private String[] authorIds = {};

	@Transient
	private Integer pageView;

	@Transient
	private String[] tags = {};
	
	@Transient
	private Integer commentCount;
	
	@Transient
	private List<Comment> comments;
	
	@Transient
	private boolean existOne;

	@Data
	public static class Comment {
		private Integer commentId;
		private String userId;
		private String userName;
		private String comment;
		@JsonFormat(pattern = CommonConstants.TIME_FORMAT_1)
		private LocalDateTime createTime;
		@JsonFormat(pattern = CommonConstants.TIME_FORMAT_1)
		private LocalDateTime updateTime;
	}

	@Embeddable
	@Data
	public static class KhNotebookId implements Serializable {
		private static final long serialVersionUID = 1L;

		@Column(name = "notebook_id")
		private String notebookId;

		@Column(name = "record_status")
		private String recordStatus;
	}
}
