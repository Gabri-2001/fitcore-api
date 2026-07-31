package com.gabri.fitcoreapi.exercise.repository;

import com.gabri.fitcoreapi.exercise.domain.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    Optional<Exercise> findByCode(String code);

    Optional<Exercise> findByCodeAndActiveTrue(String code);

    List<Exercise> findByActiveTrueOrderByNameAsc();

    boolean existsByCode(String code);
}
