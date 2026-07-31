package com.gabri.fitcoreapi.exercise.repository;

import com.gabri.fitcoreapi.exercise.domain.ExerciseMuscleActivation;
import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;

public interface ExerciseMuscleActivationRepository extends JpaRepository<ExerciseMuscleActivation, Long> {
    @EntityGraph(attributePaths = "muscle")
    List<ExerciseMuscleActivation> findByExerciseVariantOrderByActivationLevelDesc(ExerciseVariant exerciseVariant);
}
