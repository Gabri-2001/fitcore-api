package com.gabri.fitcoreapi.progress.repository;

import com.gabri.fitcoreapi.progress.domain.ProgressRecord;
import com.gabri.fitcoreapi.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.time.LocalDate;
import java.util.Optional;

public interface ProgressRecordRepository extends JpaRepository<ProgressRecord, Long> {

    List<ProgressRecord> findByUserOrderByRecordDateDesc(User user);

    List<ProgressRecord> findByUserIdAndRecordDateBetweenOrderByRecordDateAsc(
            Long userId, LocalDate from, LocalDate to);

    Optional<ProgressRecord> findByUserIdAndRecordDate(Long userId, LocalDate recordDate);
}
