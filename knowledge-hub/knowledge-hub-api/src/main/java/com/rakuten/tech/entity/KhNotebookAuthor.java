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
@Table(name = "kh_assoc_notebook_author")
@Proxy(lazy = false)
public class KhNotebookAuthor {

	@EmbeddedId
	private KhNootbookAuthorId id;

	@Column(name = "author_order")
	private Integer authorOrder;

	@Embeddable
	@Data
	public static class KhNootbookAuthorId implements Serializable {

		private static final long serialVersionUID = 1L;

		@Column(name = "notebook_id")
		private String notebookId;

		@Column(name = "author_id")
		private String authorId;

		@Column(name = "record_status")
		private String recordStatus = "0";
	}
}
