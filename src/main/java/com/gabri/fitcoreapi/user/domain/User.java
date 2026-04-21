package com.gabri.fitcoreapi.user.domain;


import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.nutrition.domain.DietPlan;
import com.gabri.fitcoreapi.nutrition.domain.NutritionLog;
import com.gabri.fitcoreapi.workout.domain.WorkoutPlan;
import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column
    private Integer age;

    @Column(name = "height_cm", precision = 5, scale = 2)
    private BigDecimal heightCm;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    private BigDecimal weightKg;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GoalProfile> goalProfiles = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutPlan> workoutPlans = new ArrayList<>();

    protected User() {
    }

    public User(String name, String email, Integer age, BigDecimal heightCm, BigDecimal weightKg) {
        this.name = name;
        this.email = email;
        this.age = age;
        this.heightCm = heightCm;
        this.weightKg = weightKg;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Integer getAge() {
        return age;
    }

    public BigDecimal getHeightCm() {
        return heightCm;
    }

    public BigDecimal getWeightKg() {
        return weightKg;
    }

    public List<GoalProfile> getGoalProfiles() {
        return goalProfiles;
    }

    public List<WorkoutPlan> getWorkoutPlans() {
        return workoutPlans;
    }

    public void addGoalProfile(GoalProfile goalProfile) {
        goalProfiles.add(goalProfile);
        goalProfile.setUser(this);
    }

    public void addWorkoutPlan(WorkoutPlan workoutPlan) {
        workoutPlans.add(workoutPlan);
        workoutPlan.setUser(this);
    }

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkoutSession> workoutSessions = new ArrayList<>();

    public List<WorkoutSession> getWorkoutSessions() {
        return workoutSessions;
    }

    public void addWorkoutSession(WorkoutSession workoutSession) {
        workoutSessions.add(workoutSession);
        workoutSession.setUser(this);
    }

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DietPlan> dietPlans = new ArrayList<>();

    public List<DietPlan> getDietPlans() {
        return dietPlans;
    }

    public void addDietPlan(DietPlan dietPlan) {
        dietPlans.add(dietPlan);
        dietPlan.setUser(this);
    }

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NutritionLog> nutritionLogs = new ArrayList<>();

    public List<NutritionLog> getNutritionLogs() {
        return nutritionLogs;
    }

    public void addNutritionLog(NutritionLog nutritionLog) {
        nutritionLogs.add(nutritionLog);
        nutritionLog.setUser(this);
    }
}
