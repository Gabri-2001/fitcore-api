package com.gabri.fitcoreapi.progress.dto;

import java.time.LocalDate;
import java.util.List;

public record TrainingStatisticsResponse(
        LocalDate from,
        LocalDate to,
        TrainingPeriodStatsResponse current,
        TrainingComparisonResponse comparison,
        List<MuscleDistributionResponse> muscleDistribution,
        GoalProgressAssessmentResponse goalProgress
) {
}
