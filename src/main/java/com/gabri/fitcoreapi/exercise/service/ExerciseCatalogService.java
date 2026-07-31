package com.gabri.fitcoreapi.exercise.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.exercise.domain.*;
import com.gabri.fitcoreapi.exercise.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

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
    public List<ExerciseVariant> findVariants(String exerciseCode) {
        return variants.findByExerciseAndActiveTrueOrderByNameAsc(findExercise(exerciseCode));
    }
    public ExerciseVariant findVariant(String code) { return variants.findByCodeAndActiveTrue(code)
            .orElseThrow(() -> new ResourceNotFoundException("Exercise variant not found with code: " + code)); }
    public List<ExerciseMuscleActivation> findActivations(String variantCode) {
        return activations.findByExerciseVariantOrderByActivationLevelDesc(findVariant(variantCode));
    }
}
