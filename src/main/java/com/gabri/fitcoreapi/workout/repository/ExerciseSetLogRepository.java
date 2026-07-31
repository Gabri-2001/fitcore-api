package com.gabri.fitcoreapi.workout.repository;

import com.gabri.fitcoreapi.workout.domain.ExerciseSetLog;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExerciseSetLogRepository extends JpaRepository<ExerciseSetLog, Long> {
    List<ExerciseSetLog> findByWorkoutSessionExerciseOrderBySetNumber(WorkoutSessionExercise exercise);
    List<ExerciseSetLog> findByWorkoutSessionExerciseWorkoutSessionUserIdAndCompletedTrue(Long userId);
}
