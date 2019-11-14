package com.rakuten.tech.entity;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.Proxy;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.rakuten.tech.constants.CommonConstants;

import lombok.Data;

@Entity
@Data
@Table(name = "kh_authors")
@Proxy(lazy = false)
public class KhAuthor {

	@Id
	@Column(name = "author_id")
	private String authorId;
	
	@Column(name = "author_name")
	private String authorName;
	
	@Column(name = "user_privilege")
	private String userPrivilege;
	
	@Column(name = "is_active")
	private boolean isActive;
	
	@Column(name = "post_notif")
	private boolean postNotif;
	
	@Column(name = "comment_notif")
	private boolean commentNotif;
	
	@Column(name = "create_time")
	@JsonFormat(pattern = CommonConstants.TIME_FORMAT_1)
	private LocalDateTime createTime;

	@Column(name = "update_time")
	@JsonFormat(pattern = CommonConstants.TIME_FORMAT_1)
	private LocalDateTime updateTime;
}
