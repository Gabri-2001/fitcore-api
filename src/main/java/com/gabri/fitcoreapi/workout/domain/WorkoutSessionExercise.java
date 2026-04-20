package com.gabri.fitcoreapi.workout.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "workout_session_exercises")
public class WorkoutSessionExercise extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_session_id", nullable = false)
    private WorkoutSession workoutSession;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_exercise_id", nullable = false)
    private WorkoutExercise workoutExercise;

    @Column(nullable = false)
    private boolean completed;

    @Column(name = "performed_sets")
    private Integer performedSets;

    @Column(name = "performed_reps")
    private Integer performedReps;

    @Column(name = "performed_weight_kg", precision = 8, scale = 2)
    private BigDecimal performedWeightKg;

    @Column(name = "performed_duration_minutes")
    private Integer performedDurationMinutes;

    @Column(name = "estimated_calories_burned", precision = 8, scale = 2)
    private BigDecimal estimatedCaloriesBurned;

    @Column(length = 1500)
    private String notes;

    protected WorkoutSessionExercise() {
    }

    public WorkoutSessionExercise(
            WorkoutExercise workoutExercise,
            boolean completed,
            Integer performedSets,
            Integer performedReps,
            BigDecimal performedWeightKg,
            Integer performedDurationMinutes,
            BigDecimal estimatedCaloriesBurned,
            String notes
    ) {
        this.workoutExercise = workoutExercise;
        this.completed = completed;
        this.performedSets = performedSets;
        this.performedReps = performedReps;
        this.performedWeightKg = performedWeightKg;
        this.performedDurationMinutes = performedDurationMinutes;
        this.estimatedCaloriesBurned = estimatedCaloriesBurned;
        this.notes = notes;
    }

    public void setWorkoutSession(WorkoutSession workoutSession) {
        this.workoutSession = workoutSession;
    }

    public WorkoutSession getWorkoutSession() {
        return workoutSession;
    }

    public WorkoutExercise getWorkoutExercise() {
        return workoutExercise;
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
