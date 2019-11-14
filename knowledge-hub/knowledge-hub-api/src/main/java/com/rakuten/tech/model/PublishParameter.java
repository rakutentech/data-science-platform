package com.rakuten.tech.model;

import java.io.Serializable;
import lombok.Data;

/**
 * PublishParameter
 * 
 * @author chienchang.a.huang
 */
@Data
public class PublishParameter implements Serializable {

  private static final long serialVersionUID = 3490085080467262909L;
  private String notebookId;
  private String title;
  private String subTitle;
  private String keywords;
  private String[] authorIds;
  private String[] authorNames;
  private String[] tags;
  private String recordStatus;
  private String createTime;
  private String updateTime;
}
