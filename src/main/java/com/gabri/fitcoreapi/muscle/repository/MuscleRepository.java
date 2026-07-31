package com.gabri.fitcoreapi.muscle.repository;

import com.gabri.fitcoreapi.muscle.domain.Muscle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MuscleRepository extends JpaRepository<Muscle, Long> {
    Optional<Muscle> findByCodeAndActiveTrue(String code);
    List<Muscle> findByActiveTrueOrderByNameAsc();
}
