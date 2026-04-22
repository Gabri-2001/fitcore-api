package com.gabri.fitcoreapi.goal.dto;

import com.gabri.fitcoreapi.goal.domain.GoalType;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateGoalProfileRequest {

    private GoalType goalType;
    private BigDecimal targetCalories;
    private BigDecimal targetProtein;
    private BigDecimal targetCarbs;
    private BigDecimal targetFats;
    private Integer reviewFrequencyDays;
    private LocalDate startDate;

    public CreateGoalProfileRequest() {
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

    public LocalDate getStartDate() {
        return startDate;
    }
}