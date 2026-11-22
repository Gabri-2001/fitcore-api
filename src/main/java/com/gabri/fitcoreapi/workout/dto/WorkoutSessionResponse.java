package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionCategory;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionIntensity;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionStatus;
import com.gabri.fitcoreapi.workout.domain.WorkoutMuscleSelectionMode;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

public class WorkoutSessionResponse {

    private Long id;
    private Long workoutDayId;
    private LocalDate sessionDate;
    private WorkoutSessionCategory sessionCategory;
    private WorkoutSessionIntensity sessionIntensity;
    private WorkoutMuscleSelectionMode muscleSelectionMode;
    private List<MuscleGroup> manualMuscleGroups;
    private Integer durationMinutes;
    private String notes;
    private BigDecimal estimatedTotalCaloriesBurned;
    private WorkoutSessionStatus status;
    private Instant completedAt;

    public WorkoutSessionResponse(
            Long id,
            Long workoutDayId,
            LocalDate sessionDate,
            WorkoutSessionCategory sessionCategory,
            WorkoutSessionIntensity sessionIntensity,
            WorkoutMuscleSelectionMode muscleSelectionMode,
            List<MuscleGroup> manualMuscleGroups,
            Integer durationMinutes,
            String notes,
            BigDecimal estimatedTotalCaloriesBurned,
            WorkoutSessionStatus status,
            Instant completedAt
    ) {
        this.id = id;
        this.workoutDayId = workoutDayId;
        this.sessionDate = sessionDate;
        this.sessionCategory = sessionCategory;
        this.sessionIntensity = sessionIntensity;
        this.muscleSelectionMode = muscleSelectionMode;
        this.manualMuscleGroups = manualMuscleGroups;
        this.durationMinutes = durationMinutes;
        this.notes = notes;
        this.estimatedTotalCaloriesBurned = estimatedTotalCaloriesBurned;
        this.status = status;
        this.completedAt = completedAt;
    }

    public static WorkoutSessionResponse from(WorkoutSession workoutSession) {
        return new WorkoutSessionResponse(
                workoutSession.getId(),
                workoutSession.getWorkoutDay() != null ? workoutSession.getWorkoutDay().getId() : null,
                workoutSession.getSessionDate(),
                workoutSession.getSessionCategory(),
                workoutSession.getSessionIntensity(),
                workoutSession.getMuscleSelectionMode(),
                workoutSession.getManualMuscleGroups().stream().sorted().toList(),
                workoutSession.getDurationMinutes(),
                workoutSession.getNotes(),
                workoutSession.getEstimatedTotalCaloriesBurned(),
                workoutSession.getStatus(),
                workoutSession.getCompletedAt()
        );
    }

    public Long getId() {
        return id;
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

    public WorkoutSessionStatus getStatus() { return status; }
    public Instant getCompletedAt() { return completedAt; }
}
