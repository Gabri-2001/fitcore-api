package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionCategory;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionIntensity;

import java.math.BigDecimal;
import java.time.LocalDate;

public class WorkoutSessionResponse {

    private Long id;
    private Long workoutDayId;
    private LocalDate sessionDate;
    private WorkoutSessionCategory sessionCategory;
    private WorkoutSessionIntensity sessionIntensity;
    private Integer durationMinutes;
    private String notes;
    private BigDecimal estimatedTotalCaloriesBurned;

    public WorkoutSessionResponse(
            Long id,
            Long workoutDayId,
            LocalDate sessionDate,
            WorkoutSessionCategory sessionCategory,
            WorkoutSessionIntensity sessionIntensity,
            Integer durationMinutes,
            String notes,
            BigDecimal estimatedTotalCaloriesBurned
    ) {
        this.id = id;
        this.workoutDayId = workoutDayId;
        this.sessionDate = sessionDate;
        this.sessionCategory = sessionCategory;
        this.sessionIntensity = sessionIntensity;
        this.durationMinutes = durationMinutes;
        this.notes = notes;
        this.estimatedTotalCaloriesBurned = estimatedTotalCaloriesBurned;
    }

    public static WorkoutSessionResponse from(WorkoutSession workoutSession) {
        return new WorkoutSessionResponse(
                workoutSession.getId(),
                workoutSession.getWorkoutDay() != null ? workoutSession.getWorkoutDay().getId() : null,
                workoutSession.getSessionDate(),
                workoutSession.getSessionCategory(),
                workoutSession.getSessionIntensity(),
                workoutSession.getDurationMinutes(),
                workoutSession.getNotes(),
                workoutSession.getEstimatedTotalCaloriesBurned()
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