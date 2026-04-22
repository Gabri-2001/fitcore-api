package com.gabri.fitcoreapi.nutrition.repository;

import com.gabri.fitcoreapi.nutrition.domain.NutritionLog;
import com.gabri.fitcoreapi.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface NutritionLogRepository extends JpaRepository<NutritionLog, Long> {

    Optional<NutritionLog> findByUserAndLogDate(User user, LocalDate logDate);

    List<NutritionLog> findByUserAndLogDateBetweenOrderByLogDateDesc(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );
}