package com.rakuten.tech.model;

import java.io.Serializable;
import java.util.Date;

import lombok.Data;

/**
 * NotebookBody
 * 
 * @author chienchang.a.huang
 */
@Data
public class NotebookBody implements Serializable {

  private static final long serialVersionUID = -7177474813382252056L;

  private String notebookId;
  private String title;
  private String subTitle;
  private String[] authors;
  private String[] tags;
  private String htmlUrl;
  private String keywords;
  private String updatedUser;
  private Date createTime;
  private Date updatedTime;
  private Integer pageView;
  private Integer commentCount;
}
