package com.rakuten.tech.repository;

import java.util.List;

import javax.persistence.Tuple;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.rakuten.tech.entity.KhAuthor;

/**
 * KhAuthorRepository
 * 
 * @author chienchang.a.huang
 */
public interface KhAuthorRepository
    extends JpaRepository<KhAuthor, String>, JpaSpecificationExecutor<KhAuthor> {

	@Query(value="select * from kh_authors where author_name =?1", nativeQuery = true)
	KhAuthor findAuthorByName(String authorName);
	
	@Query(value="select author_id, author_name from kh_authors f where f.is_active=?1 and f.post_notif=?2", nativeQuery = true)
	List<Tuple> findUserListForPostNotif(boolean isActive, boolean notify);
}
