package com.gabri.fitcoreapi.workout.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.OneToMany;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_session_exercises")
public class WorkoutSessionExercise extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_session_id", nullable = false)
    private WorkoutSession workoutSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_exercise_id")
    private WorkoutExercise workoutExercise;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercise_variant_id", nullable = false)
    private ExerciseVariant exerciseVariant;

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

    @OneToMany(mappedBy = "workoutSessionExercise", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExerciseSetLog> setLogs = new ArrayList<>();

    protected WorkoutSessionExercise() {
    }

    public WorkoutSessionExercise(
            WorkoutExercise workoutExercise,
            ExerciseVariant exerciseVariant,
            boolean completed,
            Integer performedSets,
            Integer performedReps,
            BigDecimal performedWeightKg,
            Integer performedDurationMinutes,
            BigDecimal estimatedCaloriesBurned,
            String notes
    ) {
        this.workoutExercise = workoutExercise;
        this.exerciseVariant = exerciseVariant;
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

    public ExerciseVariant getExerciseVariant() { return exerciseVariant; }

    public boolean isExtra() { return workoutExercise == null; }

    public List<ExerciseSetLog> getSetLogs() { return setLogs; }

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
