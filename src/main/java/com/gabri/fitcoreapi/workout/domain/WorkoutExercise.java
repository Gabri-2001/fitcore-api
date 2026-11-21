package com.gabri.fitcoreapi.workout.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "workout_exercises")
public class WorkoutExercise extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_day_id", nullable = false)
    private WorkoutDay workoutDay;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exercise_variant_id", nullable = false)
    private ExerciseVariant exerciseVariant;

    @Column(nullable = false)
    private Integer sets;

    private Integer reps;

    @Column(name="target_duration_seconds")
    private Integer targetDurationSeconds;
    @Column(name="target_distance_meters",precision=12,scale=2)
    private java.math.BigDecimal targetDistanceMeters;

    @Column(name = "rest_seconds")
    private Integer restSeconds;

    @Column(name = "exercise_order", nullable = false)
    private Integer exerciseOrder;

    protected WorkoutExercise() {
    }

    public WorkoutExercise(ExerciseVariant exerciseVariant, Integer sets, Integer reps, Integer restSeconds, Integer exerciseOrder) {
        this.exerciseVariant = exerciseVariant;
        this.sets = sets;
        this.reps = reps;
        this.restSeconds = restSeconds;
        this.exerciseOrder = exerciseOrder;
    }

    public WorkoutExercise(ExerciseVariant variant, Integer sets, Integer reps,
            Integer restSeconds, Integer order, Integer targetDurationSeconds,
            java.math.BigDecimal targetDistanceMeters) {
        this(variant, sets, reps, restSeconds, order);
        this.targetDurationSeconds = targetDurationSeconds;
        this.targetDistanceMeters = targetDistanceMeters;
    }
    public Integer getTargetDurationSeconds() { return targetDurationSeconds; }
    public java.math.BigDecimal getTargetDistanceMeters() { return targetDistanceMeters; }

    public void setWorkoutDay(WorkoutDay workoutDay) {
        this.workoutDay = workoutDay;
    }

    public WorkoutDay getWorkoutDay() {
        return workoutDay;
    }

    public ExerciseVariant getExerciseVariant() {
        return exerciseVariant;
    }

    public Integer getSets() {
        return sets;
    }

    public Integer getReps() {
        return reps;
    }

    public Integer getRestSeconds() {
        return restSeconds;
    }

    public Integer getExerciseOrder() {
        return exerciseOrder;
    }

    public void changeOrder(Integer exerciseOrder) {
        if (exerciseOrder == null || exerciseOrder < 1) {
            throw new IllegalArgumentException("Exercise order must be greater than zero");
        }
        this.exerciseOrder = exerciseOrder;
    }

    public void updatePrescription(ExerciseVariant exerciseVariant, Integer sets, Integer reps, Integer restSeconds) {
        this.exerciseVariant = exerciseVariant;
        this.sets = sets;
        this.reps = reps;
        this.restSeconds = restSeconds;
    }
}
