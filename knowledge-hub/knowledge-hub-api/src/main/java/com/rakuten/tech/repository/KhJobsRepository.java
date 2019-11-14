package com.rakuten.tech.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import com.rakuten.tech.entity.KhJob;

/**
 * KhJobsRepository
 * 
 * @author chienchang.a.huang
 */
public interface KhJobsRepository extends JpaRepository<KhJob, String>, JpaSpecificationExecutor<KhJob> {
	
	@Query(value="select distinct(tag_id) from kh_jobs", nativeQuery = true)
	String[] findAllTags();
	
}
