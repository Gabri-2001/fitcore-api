package com.gabri.fitcoreapi.workout.repository;

import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {

    List<WorkoutSession> findByUserAndSessionDate(User user, LocalDate sessionDate);

    List<WorkoutSession> findByUserAndSessionDateBetweenOrderBySessionDateDesc(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );

    List<WorkoutSession> findByUserOrderBySessionDateDesc(User user);

    Optional<WorkoutSession> findByIdAndUser(Long id, User user);
}