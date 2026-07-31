package com.gabri.fitcoreapi.progress.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ExerciseProgressResponse(String code, BigDecimal maximumWeight, Integer maximumReps,
        BigDecimal totalVolume, BigDecimal bestEstimatedOneRepMax, long completedSets,
        List<ProgressPoint> history) {
    public record ProgressPoint(LocalDate date, String exerciseVariantCode, BigDecimal weight,
            Integer reps, BigDecimal volume, BigDecimal estimatedOneRepMax) {}
}
