package com.gabri.fitcoreapi.workout.repository;

import com.gabri.fitcoreapi.workout.domain.WorkoutExercise;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutExerciseRepository extends JpaRepository<WorkoutExercise, Long> {}
