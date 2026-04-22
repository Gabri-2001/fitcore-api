package com.gabri.fitcoreapi.progress.repository;

import com.gabri.fitcoreapi.progress.domain.DailyEvaluation;
import com.gabri.fitcoreapi.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyEvaluationRepository extends JpaRepository<DailyEvaluation, Long> {

    Optional<DailyEvaluation> findByUserAndEvaluationDate(User user, LocalDate evaluationDate);

    List<DailyEvaluation> findByUserOrderByEvaluationDateDesc(User user);
}