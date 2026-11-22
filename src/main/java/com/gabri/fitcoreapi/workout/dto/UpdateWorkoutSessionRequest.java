package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.WorkoutSessionCategory;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionIntensity;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record UpdateWorkoutSessionRequest(
        LocalDate sessionDate,
        com.gabri.fitcoreapi.workout.domain.WorkoutDayType trainingDayType,
        Boolean trainingDayTypeManual,
        WorkoutSessionCategory sessionCategory,
        WorkoutSessionIntensity sessionIntensity,
        @Min(1) Integer durationMinutes,
        @Size(max = 1500) String notes,
        @DecimalMin("0.0") BigDecimal estimatedTotalCaloriesBurned
) {
}
