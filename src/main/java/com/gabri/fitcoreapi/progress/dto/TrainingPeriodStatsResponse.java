package com.gabri.fitcoreapi.progress.dto;

import java.math.BigDecimal;

public record TrainingPeriodStatsResponse(
        long workouts,
        long durationMinutes,
        long completedSets,
        BigDecimal totalVolume,
        BigDecimal bestEstimatedOneRepMax
) {
}
