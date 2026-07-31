package com.gabri.fitcoreapi.exercise.dto;

import com.gabri.fitcoreapi.exercise.domain.*;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import java.math.BigDecimal;

public record ExerciseResponse(Long id, String code, String name, ExerciseCategory exerciseCategory,
        MuscleGroup mainMuscleGroup, MovementPattern movementPattern, String description,
        CaloriesEstimationType caloriesEstimationType, BigDecimal baseCaloriesPerUnit,
        String defaultUnit, boolean active) {
    public static ExerciseResponse from(Exercise value) {
        return new ExerciseResponse(value.getId(), value.getCode(), value.getName(), value.getExerciseCategory(),
                value.getMainMuscleGroup(), value.getMovementPattern(), value.getDescription(),
                value.getCaloriesEstimationType(), value.getBaseCaloriesPerUnit(), value.getDefaultUnit(), value.isActive());
    }
}
