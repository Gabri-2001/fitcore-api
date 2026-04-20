package com.gabri.fitcoreapi.workout.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.exercise.domain.Exercise;
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
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(nullable = false)
    private Integer sets;

    @Column(nullable = false)
    private Integer reps;

    @Column(name = "rest_seconds")
    private Integer restSeconds;

    @Column(name = "exercise_order", nullable = false)
    private Integer exerciseOrder;

    protected WorkoutExercise() {
    }

    public WorkoutExercise(Exercise exercise, Integer sets, Integer reps, Integer restSeconds, Integer exerciseOrder) {
        this.exercise = exercise;
        this.sets = sets;
        this.reps = reps;
        this.restSeconds = restSeconds;
        this.exerciseOrder = exerciseOrder;
    }

    public void setWorkoutDay(WorkoutDay workoutDay) {
        this.workoutDay = workoutDay;
    }

    public WorkoutDay getWorkoutDay() {
        return workoutDay;
    }

    public Exercise getExercise() {
        return exercise;
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
}
