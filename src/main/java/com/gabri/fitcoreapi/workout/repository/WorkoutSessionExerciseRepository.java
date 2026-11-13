package com.gabri.fitcoreapi.workout.repository;

import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkoutSessionExerciseRepository extends JpaRepository<WorkoutSessionExercise, Long> {

    @EntityGraph(attributePaths = {"exerciseVariant", "workoutExercise"})
    List<WorkoutSessionExercise> findByWorkoutSession(WorkoutSession workoutSession);

    @EntityGraph(attributePaths = {"exerciseVariant", "workoutExercise"})
    Optional<WorkoutSessionExercise> findByIdAndWorkoutSessionUserId(Long id, Long userId);
}
