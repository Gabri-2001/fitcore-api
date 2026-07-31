package com.gabri.fitcoreapi.exercise.repository;

import com.gabri.fitcoreapi.exercise.domain.Exercise;
import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

public interface ExerciseVariantRepository extends JpaRepository<ExerciseVariant, Long> {
    @EntityGraph(attributePaths = "exercise")
    Optional<ExerciseVariant> findByCodeAndActiveTrue(String code);
    @EntityGraph(attributePaths = "exercise")
    List<ExerciseVariant> findByActiveTrueOrderByNameAsc();
    @EntityGraph(attributePaths = "exercise")
    List<ExerciseVariant> findByExerciseAndActiveTrueOrderByNameAsc(Exercise exercise);
}
