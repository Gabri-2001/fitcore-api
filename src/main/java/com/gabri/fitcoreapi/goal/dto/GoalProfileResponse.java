package com.gabri.fitcoreapi.goal.dto;

import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.goal.domain.GoalType;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class GoalProfileResponse {

    private Long id;
    private GoalType goalType;
    private BigDecimal targetCalories;
    private BigDecimal targetProtein;
    private BigDecimal targetCarbs;
    private BigDecimal targetFats;
    private Integer reviewFrequencyDays;
    private Integer version;
    private boolean active;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal targetWeightKg;
    private BigDecimal targetBodyFatPercentage;
    private BigDecimal targetMuscleMassKg;
    private LocalDate targetDate;
    private Integer targetTrainingDaysPerWeek;
    private List<MuscleGroup> priorityMuscleGroups;

    public GoalProfileResponse(
            Long id,
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
        this.id = id;
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
        this.priorityMuscleGroups = priorityMuscleGroups;
    }

    public static GoalProfileResponse from(GoalProfile goalProfile) {
        return new GoalProfileResponse(
                goalProfile.getId(),
                goalProfile.getGoalType(),
                goalProfile.getTargetCalories(),
                goalProfile.getTargetProtein(),
                goalProfile.getTargetCarbs(),
                goalProfile.getTargetFats(),
                goalProfile.getReviewFrequencyDays(),
                goalProfile.getVersion(),
                goalProfile.isActive(),
                goalProfile.getStartDate(),
                goalProfile.getEndDate(),
                goalProfile.getTargetWeightKg(),
                goalProfile.getTargetBodyFatPercentage(),
                goalProfile.getTargetMuscleMassKg(),
                goalProfile.getTargetDate(),
                goalProfile.getTargetTrainingDaysPerWeek(),
                goalProfile.getPriorityMuscleGroups()
        );
    }

    public Long getId() {
        return id;
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

    public BigDecimal getTargetWeightKg() { return targetWeightKg; }
    public BigDecimal getTargetBodyFatPercentage() { return targetBodyFatPercentage; }
    public BigDecimal getTargetMuscleMassKg() { return targetMuscleMassKg; }
    public LocalDate getTargetDate() { return targetDate; }
    public Integer getTargetTrainingDaysPerWeek() { return targetTrainingDaysPerWeek; }
    public List<MuscleGroup> getPriorityMuscleGroups() { return priorityMuscleGroups; }
}
