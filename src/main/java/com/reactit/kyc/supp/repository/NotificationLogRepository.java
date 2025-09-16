package com.reactit.kyc.supp.repository;

import com.reactit.kyc.supp.domain.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    @Query("SELECT COALESCE(SUM(n.emailsSent), 0) FROM NotificationLog n")
    int totalEmailsSent();
}

