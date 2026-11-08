package com.gabri.fitcoreapi.workout.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateWorkoutSessionExerciseRequest(
        boolean completed,
        @Min(0) Integer performedSets,
        @Min(0) Integer performedReps,
        @DecimalMin("0.0") BigDecimal performedWeightKg,
        @Min(0) Integer performedDurationMinutes,
        @DecimalMin("0.0") BigDecimal estimatedCaloriesBurned,
        @Size(max = 1500) String notes
) {
}
