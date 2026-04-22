package com.gabri.fitcoreapi.progress.repository;

import com.gabri.fitcoreapi.progress.domain.ProgressRecord;
import com.gabri.fitcoreapi.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgressRecordRepository extends JpaRepository<ProgressRecord, Long> {

    List<ProgressRecord> findByUserOrderByRecordDateDesc(User user);
}
