package com.gabri.fitcoreapi.goal.domain;

import com.gabri.fitcoreapi.common.model.BaseEntity;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.OrderColumn;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "goal_profiles")
public class GoalProfile extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type", nullable = false, length = 40)
    private GoalType goalType;

    @Column(name = "target_calories", precision = 8, scale = 2)
    private BigDecimal targetCalories;

    @Column(name = "target_protein", precision = 8, scale = 2)
    private BigDecimal targetProtein;

    @Column(name = "target_carbs", precision = 8, scale = 2)
    private BigDecimal targetCarbs;

    @Column(name = "target_fats", precision = 8, scale = 2)
    private BigDecimal targetFats;

    @Column(name = "review_frequency_days")
    private Integer reviewFrequencyDays;

    @Column(name = "target_weight_kg", precision = 5, scale = 2)
    private BigDecimal targetWeightKg;

    @Column(name = "target_body_fat_percentage", precision = 5, scale = 2)
    private BigDecimal targetBodyFatPercentage;

    @Column(name = "target_muscle_mass_kg", precision = 5, scale = 2)
    private BigDecimal targetMuscleMassKg;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "target_training_days_per_week")
    private Integer targetTrainingDaysPerWeek;

    @ElementCollection
    @CollectionTable(name = "goal_profile_muscle_priorities",
            joinColumns = @JoinColumn(name = "goal_profile_id"))
    @OrderColumn(name = "priority_order")
    @Enumerated(EnumType.STRING)
    @Column(name = "muscle_group", nullable = false, length = 40)
    private List<MuscleGroup> priorityMuscleGroups = new ArrayList<>();

    @Column(nullable = false)
    private Integer version;

    @Column(nullable = false)
    private boolean active;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "previous_goal_profile_id")
    private GoalProfile previousGoalProfile;

    protected GoalProfile() {
    }

    public GoalProfile(
            GoalType goalType,
            BigDecimal targetCalories,
            BigDecimal targetProtein,
            BigDecimal targetCarbs,
            BigDecimal targetFats,
            Integer reviewFrequencyDays,
            Integer version,
            boolean active,
            LocalDate startDate,
            LocalDate endDate
    ) {
        this(goalType, targetCalories, targetProtein, targetCarbs, targetFats, reviewFrequencyDays,
                version, active, startDate, endDate, null, null, null, null, null, List.of());
    }

    public GoalProfile(
            GoalType goalType,
            BigDecimal targetCalories,
            BigDecimal targetProtein,
            BigDecimal targetCarbs,
            BigDecimal targetFats,
            Integer reviewFrequencyDays,
            Integer version,
            boolean active,
            LocalDate startDate,
            LocalDate endDate,
            BigDecimal targetWeightKg,
            BigDecimal targetBodyFatPercentage,
            BigDecimal targetMuscleMassKg,
            LocalDate targetDate,
            Integer targetTrainingDaysPerWeek,
            List<MuscleGroup> priorityMuscleGroups
    ) {
        this.goalType = goalType;
        this.targetCalories = targetCalories;
        this.targetProtein = targetProtein;
        this.targetCarbs = targetCarbs;
        this.targetFats = targetFats;
        this.reviewFrequencyDays = reviewFrequencyDays;
        this.version = version;
        this.active = active;
        this.startDate = startDate;
        this.endDate = endDate;
        this.targetWeightKg = targetWeightKg;
        this.targetBodyFatPercentage = targetBodyFatPercentage;
        this.targetMuscleMassKg = targetMuscleMassKg;
        this.targetDate = targetDate;
        this.targetTrainingDaysPerWeek = targetTrainingDaysPerWeek;
        this.priorityMuscleGroups = priorityMuscleGroups == null
                ? new ArrayList<>() : new ArrayList<>(priorityMuscleGroups);
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setPreviousGoalProfile(GoalProfile previousGoalProfile) {
        this.previousGoalProfile = previousGoalProfile;
    }

    public User getUser() {
        return user;
    }

    public GoalType getGoalType() {
        return goalType;
    }

    public BigDecimal getTargetCalories() {
        return targetCalories;
    }

    public BigDecimal getTargetProtein() {
        return targetProtein;
    }

    public BigDecimal getTargetCarbs() {
        return targetCarbs;
    }

    public BigDecimal getTargetFats() {
        return targetFats;
    }

    public Integer getReviewFrequencyDays() {
        return reviewFrequencyDays;
    }

    public BigDecimal getTargetWeightKg() { return targetWeightKg; }
    public BigDecimal getTargetBodyFatPercentage() { return targetBodyFatPercentage; }
    public BigDecimal getTargetMuscleMassKg() { return targetMuscleMassKg; }
    public LocalDate getTargetDate() { return targetDate; }
    public Integer getTargetTrainingDaysPerWeek() { return targetTrainingDaysPerWeek; }
    public List<MuscleGroup> getPriorityMuscleGroups() { return List.copyOf(priorityMuscleGroups); }

    public Integer getVersion() {
        return version;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public GoalProfile getPreviousGoalProfile() {
        return previousGoalProfile;
    }

    public void deactivate(LocalDate endDate) {
        this.active = false;
        this.endDate = endDate;
    }
}
