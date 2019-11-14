package com.rakuten.tech.entity;

import java.io.Serializable;
import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.Proxy;

import lombok.Data;

@Entity
@Data
@Table(name = "kh_tags")
@Proxy(lazy = false)
public class KhTag implements Serializable{
  	
  	private static final long serialVersionUID = 1L;
  	
  	@Id
  	@Column(name = "tag_id")
  	private String tagId;
  	
  	@Column(name = "tag_description")
  	private String tagDescription;
  	
  	@Column(name = "create_time")
	private LocalDateTime createTime;
}
