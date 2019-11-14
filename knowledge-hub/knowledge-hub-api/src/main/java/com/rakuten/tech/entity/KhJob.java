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
@Table(name = "kh_jobs")
@Proxy(lazy = false)
public class KhJob {

	@Id 
	@Column(name = "job_name")
	private String jobName;
	
	@Column(name = "period_start_time")
	@JsonFormat(pattern=CommonConstants.TIME_FORMAT_1)
	private LocalDateTime periodStartTime;
	
	@Column(name = "locked_by")
	private String locakBy;
	
	@Column(name = "update_time")
	@JsonFormat(pattern=CommonConstants.TIME_FORMAT_1)
	private LocalDateTime updateTime;
	
	
}
