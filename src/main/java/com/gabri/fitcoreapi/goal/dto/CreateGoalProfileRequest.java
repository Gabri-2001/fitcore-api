package com.gabri.fitcoreapi.goal.dto;

import com.gabri.fitcoreapi.goal.domain.GoalType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateGoalProfileRequest {

    @NotNull(message = "{validation.goal.goalType.required}")
    private GoalType goalType;

    @DecimalMin(value = "0.0", inclusive = true, message = "{validation.goal.targetCalories.min}")
    private BigDecimal targetCalories;

    @DecimalMin(value = "0.0", inclusive = true, message = "{validation.goal.targetProtein.min}")
    private BigDecimal targetProtein;

    @DecimalMin(value = "0.0", inclusive = true, message = "{validation.goal.targetCarbs.min}")
    private BigDecimal targetCarbs;

    @DecimalMin(value = "0.0", inclusive = true, message = "{validation.goal.targetFats.min}")
    private BigDecimal targetFats;

    @Min(value = 1, message = "{validation.goal.reviewFrequency.min}")
    private Integer reviewFrequencyDays;

    @NotNull(message = "{validation.goal.startDate.required}")
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