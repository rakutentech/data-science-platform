package com.rakuten.tech.entity;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Proxy;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.rakuten.tech.constants.CommonConstants;

import lombok.Data;

@Entity
@Data
@Table(name = "kh_comments")
@Proxy(lazy = false)
public class KhComment{

	@Id 
	@GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
	@GenericGenerator(name = "native", strategy = "native")
	@Column(name = "comment_id")
	private Integer commentId;

	@Column(name = "notebook_id")
	private String notebookId;
	
	@Column(name = "user_id")
	private String userId;
	
	@Column(name = "user_name")
	private String userName;
	
	@Column(name = "comment")
	private String comment;
	
	@Column(name = "create_time")
	@JsonFormat(pattern=CommonConstants.TIME_FORMAT_1)
	private LocalDateTime createTime;
	
	@Column(name = "update_time")
	@JsonFormat(pattern=CommonConstants.TIME_FORMAT_1)
	private LocalDateTime updateTime;
}
