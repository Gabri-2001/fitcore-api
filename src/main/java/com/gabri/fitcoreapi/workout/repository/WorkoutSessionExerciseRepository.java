package com.gabri.fitcoreapi.workout.repository;

import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

public interface WorkoutSessionExerciseRepository extends JpaRepository<WorkoutSessionExercise, Long> {

    @EntityGraph(attributePaths = {"exerciseVariant", "workoutExercise"})
    List<WorkoutSessionExercise> findByWorkoutSession(WorkoutSession workoutSession);

    @EntityGraph(attributePaths = {"exerciseVariant", "workoutExercise"})
    Optional<WorkoutSessionExercise> findByIdAndWorkoutSessionUserId(Long id, Long userId);

    Optional<WorkoutSessionExercise> findFirstByWorkoutSessionUserIdAndExerciseVariantIdAndWorkoutSessionStatusAndWorkoutSessionIdNotAndWorkoutSessionSessionDateLessThanEqualOrderByWorkoutSessionSessionDateDescWorkoutSessionCompletedAtDesc(
            Long userId,
            Long exerciseVariantId,
            WorkoutSessionStatus status,
            Long excludedSessionId,
            LocalDate latestDate
    );
}
