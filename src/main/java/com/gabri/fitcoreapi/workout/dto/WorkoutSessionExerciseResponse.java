package com.gabri.fitcoreapi.workout.dto;

import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;

import java.math.BigDecimal;

public class WorkoutSessionExerciseResponse {

    private Long id;
    private Long workoutExerciseId;
    private String exerciseVariantCode;
    private boolean extra;
    private boolean completed;
    private Integer restSeconds;
    private Integer performedSets;
    private Integer performedReps;
    private BigDecimal performedWeightKg;
    private Integer performedDurationMinutes;
    private BigDecimal estimatedCaloriesBurned;
    private String notes;

    public WorkoutSessionExerciseResponse(
            Long id,
            Long workoutExerciseId,
            String exerciseVariantCode,
            boolean extra,
            boolean completed,
            Integer restSeconds,
            Integer performedSets,
            Integer performedReps,
            BigDecimal performedWeightKg,
            Integer performedDurationMinutes,
            BigDecimal estimatedCaloriesBurned,
            String notes
    ) {
        this.id = id;
        this.workoutExerciseId = workoutExerciseId;
        this.exerciseVariantCode = exerciseVariantCode;
        this.extra = extra;
        this.completed = completed;
        this.restSeconds = restSeconds;
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
                sessionExercise.getWorkoutExercise() == null ? null : sessionExercise.getWorkoutExercise().getId(),
                sessionExercise.getExerciseVariant().getCode(),
                sessionExercise.isExtra(),
                sessionExercise.isCompleted(),
                sessionExercise.getRestSeconds(),
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

    public String getExerciseVariantCode() { return exerciseVariantCode; }
    public boolean isExtra() { return extra; }

    public boolean isCompleted() {
        return completed;
    }

    public Integer getRestSeconds() {
        return restSeconds;
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
