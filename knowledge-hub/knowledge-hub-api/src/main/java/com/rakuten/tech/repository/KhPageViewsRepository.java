package com.rakuten.tech.repository;

import java.util.List;

import javax.persistence.Tuple;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.rakuten.tech.entity.KhPageView;

/**
 * KhPageViewsRepository
 * 
 * @author chienchang.a.huang
 */
public interface KhPageViewsRepository
    extends JpaRepository<KhPageView, String>, JpaSpecificationExecutor<KhPageView> {
	
	@Query(value="select notebook_id, count(*) view_count from kh_pageviews where notebook_id in(?1) group by notebook_id", nativeQuery = true)
	List<Tuple> findPageViewCountByNotbookIds(List<String> notebookId);
	
	
	@Query(value="select * from (select v.notebook_id, count(v.view_id) view_count, n.notebook_title, n.create_time, n.update_time from kh_pageviews v, kh_notebook n"
			+ " where v.notebook_id = n.notebook_id"
			+ " and n.record_status = ?1"
			+ " and v.notebook_id is not null group by v.notebook_id) a order by a.view_count desc limit ?2", nativeQuery = true)
	List<Tuple> findTopViewCountPages(String status, Integer limit);

}
