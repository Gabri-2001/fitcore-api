package com.gabri.fitcoreapi.workout.repository;

import com.gabri.fitcoreapi.workout.domain.ExerciseSetLog;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface ExerciseSetLogRepository extends JpaRepository<ExerciseSetLog, Long> {
    List<ExerciseSetLog> findByWorkoutSessionExerciseOrderBySetNumber(WorkoutSessionExercise exercise);
    java.util.Optional<ExerciseSetLog> findByIdAndWorkoutSessionExerciseIdAndWorkoutSessionExerciseWorkoutSessionUserId(
            Long id, Long workoutSessionExerciseId, Long userId);
    List<ExerciseSetLog> findByWorkoutSessionExerciseWorkoutSessionUserIdAndCompletedTrue(Long userId);

    @Query("""
            select log from ExerciseSetLog log
            join fetch log.workoutSessionExercise sessionExercise
            join fetch sessionExercise.workoutSession session
            join fetch sessionExercise.exerciseVariant variant
            join fetch variant.exercise exercise
            where session.user.id = :userId
              and log.completed = true
              and session.status = com.gabri.fitcoreapi.workout.domain.WorkoutSessionStatus.COMPLETED
              and session.sessionDate between :from and :to
            """)
    List<ExerciseSetLog> findCompletedForStatistics(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );
}
