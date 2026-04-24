package com.gabri.fitcoreapi.workout.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CreateWorkoutSessionExerciseRequest {

    @NotNull(message = "{error.workoutExercise.notFound}")
    private Long workoutExerciseId;

    private boolean completed;

    @Min(value = 0, message = "{validation.workoutSessionExercise.performedSets.min}")
    private Integer performedSets;

    @Min(value = 0, message = "{validation.workoutSessionExercise.performedReps.min}")
    private Integer performedReps;

    private BigDecimal performedWeightKg;

    @Min(value = 0, message = "{validation.workoutSessionExercise.performedDurationMinutes.min}")
    private Integer performedDurationMinutes;

    private BigDecimal estimatedCaloriesBurned;
    private String notes;

    public CreateWorkoutSessionExerciseRequest() {
    }

    public Long getWorkoutExerciseId() {
        return workoutExerciseId;
    }

    public boolean isCompleted() {
        return completed;
    }

    public Integer getPerformedSets() {
        return performedSets;
    }

    public Integer getPerformedReps() {
        return performedReps;
    }

    public BigDecimal getPerformedWeightKg() {
        return performedWeightKg;
    }

    public Integer getPerformedDurationMinutes() {
        return performedDurationMinutes;
    }

    public BigDecimal getEstimatedCaloriesBurned() {
        return estimatedCaloriesBurned;
    }

    public String getNotes() {
        return notes;
    }
}