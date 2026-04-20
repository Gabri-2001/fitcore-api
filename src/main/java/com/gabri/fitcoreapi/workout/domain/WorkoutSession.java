package com.gabri.fitcoreapi.workout.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.user.domain.User;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "workout_sessions")
public class WorkoutSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_day_id")
    private WorkoutDay workoutDay;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_category", nullable = false, length = 40)
    private WorkoutSessionCategory sessionCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_intensity", nullable = false, length = 40)
    private WorkoutSessionIntensity sessionIntensity;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(length = 1500)
    private String notes;

    @Column(name = "estimated_total_calories_burned", precision = 8, scale = 2)
    private BigDecimal estimatedTotalCaloriesBurned;

    @OneToMany(mappedBy = "workoutSession", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutSessionExercise> sessionExercises = new ArrayList<>();

    protected WorkoutSession() {
    }

    public WorkoutSession(
            LocalDate sessionDate,
            WorkoutSessionCategory sessionCategory,
            WorkoutSessionIntensity sessionIntensity,
            Integer durationMinutes,
            String notes,
            BigDecimal estimatedTotalCaloriesBurned
    ) {
        this.sessionDate = sessionDate;
        this.sessionCategory = sessionCategory;
        this.sessionIntensity = sessionIntensity;
        this.durationMinutes = durationMinutes;
        this.notes = notes;
        this.estimatedTotalCaloriesBurned = estimatedTotalCaloriesBurned;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setWorkoutDay(WorkoutDay workoutDay) {
        this.workoutDay = workoutDay;
    }

    public void addSessionExercise(WorkoutSessionExercise sessionExercise) {
        sessionExercises.add(sessionExercise);
        sessionExercise.setWorkoutSession(this);
    }

    public User getUser() {
        return user;
    }

    public WorkoutDay getWorkoutDay() {
        return workoutDay;
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

    public List<WorkoutSessionExercise> getSessionExercises() {
        return sessionExercises;
    }
}
