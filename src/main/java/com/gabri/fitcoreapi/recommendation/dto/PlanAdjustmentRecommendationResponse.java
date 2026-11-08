package com.gabri.fitcoreapi.recommendation.dto;

import com.gabri.fitcoreapi.recommendation.domain.PlanAdjustmentRecommendation;
import com.gabri.fitcoreapi.recommendation.domain.RecommendationStatus;
import com.gabri.fitcoreapi.recommendation.domain.RecommendationType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PlanAdjustmentRecommendationResponse(
        Long id,
        Long goalProfileId,
        Long workoutPlanId,
        LocalDate recommendationDate,
        RecommendationType recommendationType,
        String reason,
        BigDecimal proposedCaloriesChange,
        Integer proposedCardioChangeMinutes,
        Integer proposedSetsChange,
        Integer proposedRepsChange,
        RecommendationStatus status
) {
    public static PlanAdjustmentRecommendationResponse from(PlanAdjustmentRecommendation value) {
        return new PlanAdjustmentRecommendationResponse(
                value.getId(), value.getGoalProfile().getId(),
                value.getWorkoutPlan() == null ? null : value.getWorkoutPlan().getId(),
                value.getRecommendationDate(), value.getRecommendationType(), value.getReason(),
                value.getProposedCaloriesChange(), value.getProposedCardioChangeMinutes(),
                value.getProposedSetsChange(), value.getProposedRepsChange(), value.getStatus());
    }
}
