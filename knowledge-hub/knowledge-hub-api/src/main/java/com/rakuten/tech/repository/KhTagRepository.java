package com.rakuten.tech.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.rakuten.tech.entity.KhTag;

/**
 * KhTagRepository
 * 
 * @author chienchang.a.huang
 */
public interface KhTagRepository extends JpaRepository<KhTag, String>, JpaSpecificationExecutor<KhTag> {
	
	@Query(value="select distinct(tag_id) from kh_tags", nativeQuery = true)
	String[] findAllTags();
	
}
