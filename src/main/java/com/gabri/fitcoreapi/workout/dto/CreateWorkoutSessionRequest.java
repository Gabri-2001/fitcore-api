package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.WorkoutSessionCategory;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionIntensity;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateWorkoutSessionRequest {

    private Long workoutDayId;

    @NotNull(message = "{validation.workoutSession.sessionDate.required}")
    private LocalDate sessionDate;

    @NotNull(message = "{validation.workoutSession.sessionCategory.required}")
    private WorkoutSessionCategory sessionCategory;

    @NotNull(message = "{validation.workoutSession.sessionIntensity.required}")
    private WorkoutSessionIntensity sessionIntensity;

    @Min(value = 1, message = "{validation.workoutSession.durationMinutes.min}")
    private Integer durationMinutes;

    private String notes;
    private BigDecimal estimatedTotalCaloriesBurned;

    public CreateWorkoutSessionRequest() {
    }

    public Long getWorkoutDayId() {
        return workoutDayId;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public WorkoutSessionCategory getSessionCategory() {
        return sessionCategory;
    }

    public WorkoutSessionIntensity getSessionIntensity() {
        return sessionIntensity;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public String getNotes() {
        return notes;
    }

    public BigDecimal getEstimatedTotalCaloriesBurned() {
        return estimatedTotalCaloriesBurned;
    }
}
