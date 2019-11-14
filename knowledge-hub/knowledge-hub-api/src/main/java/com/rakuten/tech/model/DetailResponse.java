package com.rakuten.tech.model;

import java.io.Serializable;

import lombok.Data;

/**
 * DetailResponse
 * 
 * @author chienchang.a.huang
 */
@Data
public class DetailResponse implements Serializable {

  private static final long serialVersionUID = -2445755731217417379L;

  private String title;
  private String subTitle;
  private String keywords;
  private String authors;
  private String createTime;
  private String updateTime;
  private String recordStatus;
  private String htmlUrl;

}
