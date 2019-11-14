package com.rakuten.tech.model;

import java.io.Serializable;

import lombok.Data;

/**
 * NotebookListCondition
 * 
 * @author chienchang.a.huang
 */
@Data
public class NotebookListCondition implements Serializable {

  private static final long serialVersionUID = 8219698591619699449L;
  
  private Integer pageNo = 0;
  private Integer limit = 12;
  private String startTime;
  private String endTime;
  private String title;
  private String subTitle;
  private String keyword;
  private String tag;
  private String author; // author name
  private String recordStatus;
  private String[] notebookIds;
}
