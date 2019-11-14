package com.rakuten.tech.repository;

import java.time.LocalDateTime;
import java.util.List;

import javax.persistence.Tuple;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.rakuten.tech.entity.KhNotebook;
import com.rakuten.tech.entity.KhNotebook.KhNotebookId;

/**
 * KhNotebookRepository
 * 
 * @author chienchang.a.huang
 */
public interface KhNotebookRepository
		extends JpaRepository<KhNotebook, KhNotebookId>, JpaSpecificationExecutor<KhNotebook> {

	@Query(value = "select notebook_id, notebook_title from kh_notebook where notebook_id =?1 and record_status =?2", nativeQuery = true)
	Tuple findKeyAttributes(String notebookId, String recordStatus);
	
	@Modifying
	@Query(value = "delete from kh_notebook where notebook_id =?1 and record_status =?2", nativeQuery = true)
	void deleteByNotebookId(String notebookId, String status);
	
	@Modifying
	@Query(value = "update kh_notebook set record_status =?3, update_time=now() where notebook_id =?1 and record_status =?2", nativeQuery = true)
	void updateStatusByNotebookId(String notebookId, String status, String updateStatus);

	@Query(value = "select s.notebook_id, GROUP_CONCAT(a.author_name ORDER BY s.author_order SEPARATOR ',') authors,"
			+ " notebook_title, notebook_subtitle "
			+ " from kh_assoc_notebook_author s, kh_authors a, "
			+ "(select notebook_id, notebook_title, notebook_subtitle, path, create_time, update_time"
			+ " from kh_notebook where create_time between ?1 and ?2 and record_status =?3) nb"
			+ " where s.notebook_id in(nb.notebook_id)"
			+ " and s.author_id = a.author_id"
			+ " and s.record_status =?3"
			+ " group by s.notebook_id", nativeQuery = true)
	List<Tuple> findNotebookByCreateTime(LocalDateTime startTime, LocalDateTime endTime, String recordStatus);
	
	
	@Query(value="select s.author_id, s.author_name, group_concat(DISTINCT c.notebook_id SEPARATOR ',') as notebook_id"
			+ " from kh_comments c, kh_notebook b, "
			+ "(select f.author_id, f.author_name, n.notebook_id from kh_authors f, kh_assoc_notebook_author n"
			+ " where f.is_active=?4 and f.comment_notif=?5 and f.author_id = n.author_id) s "
			+ " where c.create_time between ?1 and ?2 and b.notebook_id = c.notebook_id and b.notebook_id = s.notebook_id and b.record_status =?3 group by s.author_id", nativeQuery = true)
	List<Tuple> findNotebookHavingComment(LocalDateTime startTime, LocalDateTime endTime, String recordStatus, boolean isActive, boolean notify);

}
