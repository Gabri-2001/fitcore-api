package com.gabri.fitcoreapi.progress.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TrainingComparisonResponse(
        LocalDate previousFrom,
        LocalDate previousTo,
        TrainingPeriodStatsResponse previous,
        BigDecimal workoutsChangePercent,
        BigDecimal durationChangePercent,
        BigDecimal completedSetsChangePercent,
        BigDecimal volumeChangePercent,
        BigDecimal oneRepMaxChangePercent
) {
}
