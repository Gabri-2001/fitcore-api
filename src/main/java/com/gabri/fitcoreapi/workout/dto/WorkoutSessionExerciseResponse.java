package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;

import java.math.BigDecimal;

public class WorkoutSessionExerciseResponse {

    private Long id;
    private Long workoutExerciseId;
    private boolean completed;
    private Integer performedSets;
    private Integer performedReps;
    private BigDecimal performedWeightKg;
    private Integer performedDurationMinutes;
    private BigDecimal estimatedCaloriesBurned;
    private String notes;

    public WorkoutSessionExerciseResponse(
            Long id,
            Long workoutExerciseId,
            boolean completed,
            Integer performedSets,
            Integer performedReps,
            BigDecimal performedWeightKg,
            Integer performedDurationMinutes,
            BigDecimal estimatedCaloriesBurned,
            String notes
    ) {
        this.id = id;
        this.workoutExerciseId = workoutExerciseId;
        this.completed = completed;
        this.performedSets = performedSets;
        this.performedReps = performedReps;
        this.performedWeightKg = performedWeightKg;
        this.performedDurationMinutes = performedDurationMinutes;
        this.estimatedCaloriesBurned = estimatedCaloriesBurned;
        this.notes = notes;
    }

    public static WorkoutSessionExerciseResponse from(WorkoutSessionExercise sessionExercise) {
        return new WorkoutSessionExerciseResponse(
                sessionExercise.getId(),
                sessionExercise.getWorkoutExercise().getId(),
                sessionExercise.isCompleted(),
                sessionExercise.getPerformedSets(),
                sessionExercise.getPerformedReps(),
                sessionExercise.getPerformedWeightKg(),
                sessionExercise.getPerformedDurationMinutes(),
                sessionExercise.getEstimatedCaloriesBurned(),
                sessionExercise.getNotes()
        );
    }

    public Long getId() {
        return id;
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