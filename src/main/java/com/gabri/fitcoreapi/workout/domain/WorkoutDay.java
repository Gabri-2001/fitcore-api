package com.gabri.fitcoreapi.workout.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_days")
public class WorkoutDay extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "workout_plan_id", nullable = false)
    private WorkoutPlan workoutPlan;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(name = "day_order", nullable = false)
    private Integer dayOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_type", nullable = false, length = 40)
    private WorkoutDayType dayType;

    @OneToMany(mappedBy = "workoutDay", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutExercise> workoutExercises = new ArrayList<>();

    protected WorkoutDay() {
    }

    public WorkoutDay(String name, Integer dayOrder, WorkoutDayType dayType) {
        this.name = name;
        this.dayOrder = dayOrder;
        this.dayType = dayType;
    }

    public void setWorkoutPlan(WorkoutPlan workoutPlan) {
        this.workoutPlan = workoutPlan;
    }

    public void addWorkoutExercise(WorkoutExercise workoutExercise) {
        workoutExercises.add(workoutExercise);
        workoutExercise.setWorkoutDay(this);
    }

    public WorkoutPlan getWorkoutPlan() {
        return workoutPlan;
    }

    public String getName() {
        return name;
    }

    public Integer getDayOrder() {
        return dayOrder;
    }

    public WorkoutDayType getDayType() {
        return dayType;
    }

    public List<WorkoutExercise> getWorkoutExercises() {
        return workoutExercises;
    }
}