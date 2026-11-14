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

    @Column(name = "rest_seconds", nullable = false)
    private Integer restSeconds;

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
            Integer restSeconds,
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
        this.restSeconds = restSeconds == null ? 90 : restSeconds;
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

    public void addSetLog(ExerciseSetLog setLog) {
        setLogs.add(setLog);
    }

    public void removeSetLog(ExerciseSetLog setLog) {
        setLogs.remove(setLog);
    }

    public boolean isCompleted() {
        return completed;
    }

    public Integer getRestSeconds() {
        return restSeconds;
    }

    public void updateRestSeconds(Integer restSeconds) {
        if (restSeconds == null || restSeconds < 0 || restSeconds > 3600) {
            throw new IllegalArgumentException("Rest duration must be between 0 and 3600 seconds");
        }
        this.restSeconds = restSeconds;
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

    public void update(
            boolean completed,
            Integer performedSets,
            Integer performedReps,
            BigDecimal performedWeightKg,
            Integer performedDurationMinutes,
            BigDecimal estimatedCaloriesBurned,
            String notes
    ) {
        this.completed = completed;
        this.performedSets = performedSets;
        this.performedReps = performedReps;
        this.performedWeightKg = performedWeightKg;
        this.performedDurationMinutes = performedDurationMinutes;
        this.estimatedCaloriesBurned = estimatedCaloriesBurned;
        this.notes = notes;
    }

    public void synchronizeSetSummary() {
        if (setLogs.isEmpty()) {
            performedSets = 0;
            performedReps = 0;
            performedWeightKg = null;
            completed = false;
            return;
        }
        List<ExerciseSetLog> completedLogs = setLogs.stream().filter(ExerciseSetLog::isCompleted).toList();
        performedSets = completedLogs.size();
        performedReps = completedLogs.stream().map(ExerciseSetLog::getReps)
                .filter(java.util.Objects::nonNull).mapToInt(Integer::intValue).sum();
        performedWeightKg = completedLogs.stream().map(ExerciseSetLog::getWeight)
                .filter(java.util.Objects::nonNull).max(BigDecimal::compareTo).orElse(null);
        completed = !completedLogs.isEmpty() && completedLogs.size() == setLogs.size();
    }
}
