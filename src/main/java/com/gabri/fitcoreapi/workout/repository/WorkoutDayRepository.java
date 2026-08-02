package com.gabri.fitcoreapi.workout.repository;

import com.gabri.fitcoreapi.workout.domain.WorkoutDay;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WorkoutDayRepository extends JpaRepository<WorkoutDay, Long> {
    Optional<WorkoutDay> findByIdAndWorkoutPlanIdAndWorkoutPlanUserId(Long id, Long workoutPlanId, Long userId);
}
