package com.gabri.fitcoreapi.goal.dto;

import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.goal.domain.GoalType;

import java.math.BigDecimal;
import java.time.LocalDate;

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
            LocalDate endDate
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
                goalProfile.getEndDate()
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
}
