package com.gabri.fitcoreapi.progress.dto;

import com.gabri.fitcoreapi.goal.domain.GoalType;
import com.gabri.fitcoreapi.progress.domain.AssessmentConfidence;
import com.gabri.fitcoreapi.progress.domain.GoalProgressStatus;

import java.math.BigDecimal;
import java.util.List;

public record GoalProgressAssessmentResponse(
        GoalType goalType,
        GoalProgressStatus status,
        AssessmentConfidence confidence,
        boolean trainingAligned,
        BigDecimal trainingAdherencePercent,
        BigDecimal outcomeTrendPercent,
        String summaryKey,
        List<GoalSignalResponse> signals,
        List<String> limitationKeys,
        String targetMetric,
        BigDecimal targetValue,
        BigDecimal currentValue,
        BigDecimal remainingToTarget,
        BigDecimal targetCompletionPercent
) {
}
