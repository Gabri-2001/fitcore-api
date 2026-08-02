package com.gabri.fitcoreapi.exercise.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.exercise.domain.*;
import com.gabri.fitcoreapi.exercise.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import java.util.List;
import java.util.Set;

import static com.gabri.fitcoreapi.exercise.repository.ExerciseVariantSpecifications.searchable;

@Service
@Transactional(readOnly = true)
public class ExerciseCatalogService {
    private final ExerciseRepository exercises;
    private final ExerciseVariantRepository variants;
    private final ExerciseMuscleActivationRepository activations;

    public ExerciseCatalogService(ExerciseRepository exercises, ExerciseVariantRepository variants,
            ExerciseMuscleActivationRepository activations) {
        this.exercises = exercises;
        this.variants = variants;
        this.activations = activations;
    }

    public List<Exercise> findExercises() { return exercises.findByActiveTrueOrderByNameAsc(); }
    public Exercise findExercise(String code) { return exercises.findByCodeAndActiveTrue(code)
            .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with code: " + code)); }
    public List<ExerciseVariant> findVariants() { return variants.findByActiveTrueOrderByNameAsc(); }
    public Page<ExerciseVariant> searchVariants(String text, Set<Equipment> equipment, Set<String> muscleCodes,
            Set<MuscleGroup> muscleGroups, boolean includeStabilizers, int page, int size) {
        int safeSize = Math.min(Math.max(size, 1), 100);
        int safePage = Math.max(page, 0);
        return variants.findAll(
                searchable(text, equipment, normalizeCodes(muscleCodes), muscleGroups, includeStabilizers),
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, "name"))
        );
    }
    public List<ExerciseVariant> findVariants(String exerciseCode) {
        return variants.findByExerciseAndActiveTrueOrderByNameAsc(findExercise(exerciseCode));
    }
    public ExerciseVariant findVariant(String code) { return variants.findByCodeAndActiveTrue(code)
            .orElseThrow(() -> new ResourceNotFoundException("Exercise variant not found with code: " + code)); }
    public List<ExerciseMuscleActivation> findActivations(String variantCode) {
        return activations.findByExerciseVariantOrderByActivationLevelDesc(findVariant(variantCode));
    }

    private Set<String> normalizeCodes(Set<String> codes) {
        if (codes == null) return Set.of();
        return codes.stream().filter(code -> code != null && !code.isBlank())
                .map(String::trim).map(code -> code.toUpperCase(java.util.Locale.ROOT))
                .collect(java.util.stream.Collectors.toSet());
    }
}
