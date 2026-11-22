package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.WorkoutSessionCategory;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionIntensity;
import com.gabri.fitcoreapi.workout.domain.WorkoutMuscleSelectionMode;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record UpdateWorkoutSessionRequest(
        LocalDate sessionDate,
        WorkoutSessionCategory sessionCategory,
        WorkoutSessionIntensity sessionIntensity,
        WorkoutMuscleSelectionMode muscleSelectionMode,
        List<MuscleGroup> manualMuscleGroups,
        @Min(1) Integer durationMinutes,
        @Size(max = 1500) String notes,
        @DecimalMin("0.0") BigDecimal estimatedTotalCaloriesBurned
) {
}
