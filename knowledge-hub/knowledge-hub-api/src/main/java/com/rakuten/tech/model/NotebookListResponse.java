package com.rakuten.tech.model;

import java.io.Serializable;
import java.util.List;

import lombok.Data;

/**
 * NotebookListResponse
 * 
 * @author chienchang.a.huang
 */
@Data
public class NotebookListResponse implements Serializable {
  
  private static final long serialVersionUID = 5871247228973126940L;
  
  private Integer pageNo;
  private Integer limit;
  private Integer totalPages;
  private Long totalCount;
  private List<NotebookBody> khNotebookBodyList;

}
