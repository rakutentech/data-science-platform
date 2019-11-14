package com.rakuten.tech.repository;

import java.util.List;

import javax.persistence.Tuple;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.rakuten.tech.entity.KhNotebookAuthor;

/**
 * KhNotebookAuthorRepository
 * 
 * @author chienchang.a.huang
 */
public interface KhNotebookAuthorRepository
    extends JpaRepository<KhNotebookAuthor, String>, JpaSpecificationExecutor<KhNotebookAuthor> {
	
	@Query(value="select s.notebook_id, GROUP_CONCAT(a.author_id ORDER BY s.author_order SEPARATOR ',') authorIds from kh_assoc_notebook_author s, kh_authors a where s.notebook_id in(?1) and s.author_id = a.author_id and s.record_status =?2 group by s.notebook_id", nativeQuery = true)
	List<Tuple> findAuthorIdsByNotebookIds(List<String> notebookId, String status);
	
	@Query(value="select s.notebook_id, GROUP_CONCAT(a.author_name ORDER BY s.author_order SEPARATOR ',') authors from kh_assoc_notebook_author s, kh_authors a where s.notebook_id in(?1) and s.author_id = a.author_id and s.record_status =?2 group by s.notebook_id", nativeQuery = true)
	List<Tuple> findAuthorsByNotebookIds(List<String> notebookId, String status);
	
	@Query(value="select s.notebook_id from kh_assoc_notebook_author s, kh_authors a where s.author_id = a.author_id and a.author_name like CONCAT('%',?1,'%') and s.record_status =?2", nativeQuery = true)
	String[] findNotebookIdsByAuthor(String author, String status);
	
	@Modifying
	@Query(value="delete from kh_assoc_notebook_author where notebook_id in(?1) and record_status =?2", nativeQuery = true)
    void deleteByNotebookIds(List<String> notebookId, String status);
	
	@Query(value="select distinct author_id, author_name from kh_authors where is_active = ?1", nativeQuery = true)
	List<Tuple> findAllAuthors(boolean isActive);
	
	@Query(value="select author_id from kh_assoc_notebook_author where notebook_id =?1 and record_status =?2 and author_order=0", nativeQuery = true)
	String findMainAuthorByNotebookId(String notebookId, String status);
	
	@Modifying
	@Query(value="update kh_assoc_notebook_author set record_status =?3 where notebook_id =?1 and record_status =?2", nativeQuery = true)
    void updateStatusByNotebookId(String notebookId, String status, String updateStatus);

	@Query(value="select s.notebook_id from kh_assoc_notebook_author s, kh_authors a where s.author_id = a.author_id and a.author_name =?1 and s.record_status =?2", nativeQuery = true)
	List<String> findNotebookIdsByExcatAuthor(String authorName, String status);
	
	@Modifying
	@Query(value="delete from kh_assoc_notebook_author where notebook_id =?1 and record_status =?2", nativeQuery = true)
    void deleteByNotebookId(String notebookId, String status);
}
