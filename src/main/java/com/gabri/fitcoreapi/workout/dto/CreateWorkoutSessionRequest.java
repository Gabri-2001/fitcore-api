package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.WorkoutSessionCategory;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionIntensity;
import com.gabri.fitcoreapi.workout.domain.WorkoutMuscleSelectionMode;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class CreateWorkoutSessionRequest {

    private Long workoutDayId;

    @NotNull(message = "{validation.workoutSession.sessionDate.required}")
    private LocalDate sessionDate;

    // Legacy metadata; newer clients classify muscle groups instead.
    private WorkoutSessionCategory sessionCategory;

    // RPE and RIR belong to individual sets, not the whole session.
    private WorkoutSessionIntensity sessionIntensity;

    private WorkoutMuscleSelectionMode muscleSelectionMode = WorkoutMuscleSelectionMode.AUTO;
    private List<MuscleGroup> manualMuscleGroups = List.of();

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

    public WorkoutMuscleSelectionMode getMuscleSelectionMode() { return muscleSelectionMode; }

    public List<MuscleGroup> getManualMuscleGroups() { return manualMuscleGroups; }

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
