package com.rakuten.tech.repository;

import java.time.LocalDateTime;
import java.util.List;

import javax.persistence.Tuple;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.rakuten.tech.entity.KhComment;

/**
 * KhCommentRepository
 * 
 * @author chienchang.a.huang
 */
public interface KhCommentRepository
    extends JpaRepository<KhComment, Integer>, JpaSpecificationExecutor<KhComment> {

	@Query(value="select comment_id, user_id, user_name, comment, create_time, update_time from kh_comments where notebook_id =?1 order by create_time", nativeQuery = true)
	List<Tuple> findCommentsByNotebookId(String notebookId);
	
	@Query(value="select notebook_id, comment_id, user_id, user_name, comment, create_time, update_time from kh_comments where create_time between ?1 and ?2", nativeQuery = true)
	List<Tuple> findCommentsByCreateTime(LocalDateTime startTime, LocalDateTime endTime);
	
	@Query(value="select comment_id, user_id, user_name, comment, create_time, update_time from kh_comments where notebook_id =?1 and create_time between ?2 and ?3", nativeQuery = true)
	List<Tuple> findCommentsByNotebookIdCreateTime(String notebookId, LocalDateTime startTime, LocalDateTime endTime);

	@Query(value="select notebook_id, count(comment_id) from kh_comments where notebook_id in?1 group by notebook_id", nativeQuery = true)
	List<Tuple> findCommentCountByNotebookId(List<String> notebookIds);
}
