package com.rakuten.tech.repository;

import java.util.List;

import javax.persistence.Tuple;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.rakuten.tech.entity.KhNotebookTag;

/**
 * KhNotebookTagRepository
 * 
 * @author chienchang.a.huang
 */
public interface KhNotebookTagRepository
		extends JpaRepository<KhNotebookTag, String>, JpaSpecificationExecutor<KhNotebookTag> {

	@Query(value = "select a.notebook_id, GROUP_CONCAT(a.tag_id SEPARATOR ',') tags from kh_assoc_notebook_tag a "
			+ " where notebook_id in(?1) and record_status =?2 group by a.notebook_id", nativeQuery = true)
	List<Tuple> findTagsByNotebookIds(List<String> notebookId, String status);
	
	@Query(value = "select tag_id, count(notebook_id) view_count from kh_assoc_notebook_tag where record_status =?2 group by tag_id "
			+ "order by view_count desc limit ?1", nativeQuery = true)
	List<Tuple> findTopTags(Integer limit, String status);
	
	@Query(value="select a.notebook_id from kh_assoc_notebook_tag a where a.tag_id like CONCAT('%',?1,'%') and a.record_status=?2", nativeQuery = true)
	String[] findNotebookIdsByTagName(String tagName, String status);
	
	@Query(value="select a.notebook_id from kh_assoc_notebook_tag a where a.tag_id = ?1 and a.record_status=?2", nativeQuery = true)
	List<String> findNotebookIdsByExcatTagName(String tagName, String status);
	
	@Modifying
	@Query(value="delete from kh_assoc_notebook_tag where notebook_id in(?1) and record_status =?2", nativeQuery = true)
    void deleteByNotebookIds(List<String> notebookId, String status);
	
	@Modifying
	@Query(value="update kh_assoc_notebook_tag set record_status =?3 where notebook_id =?1 and record_status =?2", nativeQuery = true)
    void updateStatusByNotebookId(String notebookId, String status, String updateStatus);
	
	@Modifying
	@Query(value="delete from kh_assoc_notebook_tag where notebook_id =?1 and record_status =?2", nativeQuery = true)
    void deleteByNotebookId(String notebookId, String status);
}
