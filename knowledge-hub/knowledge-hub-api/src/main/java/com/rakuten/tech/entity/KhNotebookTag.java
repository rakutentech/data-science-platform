package com.rakuten.tech.entity;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.EmbeddedId;
import javax.persistence.Entity;
import javax.persistence.Table;

import org.hibernate.annotations.Proxy;

import lombok.Data;

@Entity
@Data
@Table(name = "kh_assoc_notebook_tag")
@Proxy(lazy = false)
public class KhNotebookTag{

  @EmbeddedId
  private KhNotebookTagId id;

  
  @Embeddable
  @Data
  public static class KhNotebookTagId implements Serializable{
  	
  	private static final long serialVersionUID = 1L;

  	@Column(name = "notebook_id")
  	private String notebookId;

  	@Column(name = "tag_id")
  	private String tagId;
  	
  	@Column(name = "record_status")
  	private String recordStatus = "0";
  }


}
