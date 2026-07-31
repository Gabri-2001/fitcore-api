package com.gabri.fitcoreapi.workout.repository;

import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutSessionExerciseRepository extends JpaRepository<WorkoutSessionExercise, Long> {

    List<WorkoutSessionExercise> findByWorkoutSession(WorkoutSession workoutSession);
    Optional<WorkoutSessionExercise> findByIdAndWorkoutSessionUserId(Long id, Long userId);
}
