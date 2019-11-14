package com.rakuten.tech.repository;

import java.math.BigInteger;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.rakuten.tech.entity.KhLock;

/**
 * KhLockRepository
 * 
 * @author chienchang.a.huang
 */
public interface KhLockRepository extends JpaRepository<KhLock, String>{
	
	@Query(value="select IS_FREE_LOCK(\'notify_lock\')", nativeQuery = true)
	BigInteger getFreeLock();
	
	@Query(value="select get_lock(\'notify_lock\', 1)", nativeQuery = true)
	BigInteger getLock();
	
	@Query(value="select release_lock(\'notify_lock\')", nativeQuery = true)
	BigInteger releaseLock();
}
