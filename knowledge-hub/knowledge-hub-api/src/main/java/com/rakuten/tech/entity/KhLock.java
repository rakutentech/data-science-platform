package com.rakuten.tech.entity;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;

import org.hibernate.annotations.Proxy;

import lombok.Data;

@Entity
@Data
@Proxy(lazy = false)
public class KhLock implements Serializable{
  	
  	private static final long serialVersionUID = 1L;
  	
  	@Id
  	@Column(name = "lock")
  	private String lock;
  
}
