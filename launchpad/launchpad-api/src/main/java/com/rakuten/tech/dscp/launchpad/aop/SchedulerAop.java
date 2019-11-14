package com.rakuten.tech.dscp.launchpad.aop;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.redisson.Redisson;
import org.redisson.api.RLock;
import org.redisson.config.ClusterServersConfig;
import org.redisson.config.Config;
import org.redisson.config.SingleServerConfig;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.Arrays;
import java.util.concurrent.TimeUnit;

@Aspect
@Component
@Slf4j
public class SchedulerAop {

    private static final String REDIS_PREFIX = "redis://";
    private static final String LOCK_PREFIX = "LOCK.";
    private static final int TIMEOUT = 10;
    private static final int REDIS_SCAN_INTERVAL = 30_000;
    @Value("${redis.cluster.nodes}")
    private String redisCluster;
    private Redisson redisson;

    @Pointcut("execution(* com.rakuten.tech.dscp.launchpad.service.SyncService.sync*(..))")
    public void syncUpPointcut() {
    }

    @PostConstruct
    public void init() {
        Config config = new Config();
        if (redisCluster.contains("localhost")) {
            SingleServerConfig serverConfig = config.useSingleServer();
            serverConfig.setAddress(REDIS_PREFIX + redisCluster);
        } else {
            ClusterServersConfig serverConfig = config.useClusterServers();
            serverConfig.setScanInterval(REDIS_SCAN_INTERVAL);
            Arrays.stream(redisCluster.split(",")).forEach(redisServer -> serverConfig.addNodeAddress(REDIS_PREFIX + redisServer));
        }
        redisson = (Redisson) Redisson.create(config);
    }

    @Around("syncUpPointcut()")
    public void distributedTaskProcess(ProceedingJoinPoint pjp) {
        String methodName = pjp.getSignature().getName();
        String lockName = LOCK_PREFIX + methodName.toUpperCase();
        RLock lock = redisson.getLock(lockName);
        boolean getLock = false;
        try {
            getLock = lock.tryLock(0, TIMEOUT, TimeUnit.SECONDS);
            if (getLock) {
                log.info("get distributed lock '{}' successfully ", lockName);
                pjp.proceed();
            }
        } catch (Throwable e) {
            log.error("error when processing scheduling services", e);
        } finally {
            if (getLock && lock.isHeldByCurrentThread()) {
                lock.unlock();
                log.info("release distributed lock '{}' successfully ", lockName);
            }
        }
    }

}
