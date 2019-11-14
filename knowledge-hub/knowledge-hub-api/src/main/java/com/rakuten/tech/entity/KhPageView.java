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

import lombok.Data;

@Entity
@Data
@Table(name = "kh_pageviews")
@Proxy(lazy = false)
public class KhPageView {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
	@GenericGenerator(name = "native", strategy = "native")
	@Column(name = "view_id", nullable = true)
	private Integer viewId;

	@Column(name = "user_id")
	private String userId;

	@Column(name = "notebook_id")
	private String notebookId;

	@Column(name = "object_action")
	private String objectAction;

	@Column(name = "ip_address")
	private String ipAddress;

	@Column(name = "create_time")
	private LocalDateTime createTime;

}
