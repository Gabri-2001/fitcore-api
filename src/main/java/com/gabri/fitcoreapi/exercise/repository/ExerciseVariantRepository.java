package com.gabri.fitcoreapi.exercise.repository;

import com.gabri.fitcoreapi.exercise.domain.Exercise;
import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExerciseVariantRepository extends JpaRepository<ExerciseVariant, Long> {
    Optional<ExerciseVariant> findByCodeAndActiveTrue(String code);
    List<ExerciseVariant> findByActiveTrueOrderByNameAsc();
    List<ExerciseVariant> findByExerciseAndActiveTrueOrderByNameAsc(Exercise exercise);
}
