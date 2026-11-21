package com.gabri.fitcoreapi.progress.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Historical exercise progress, using recorded values rather than inferred
 * bodyweight. Chart clients must select one variant and one metric at a time.
 */
public record ExerciseProgressResponse(
        String code, BigDecimal maximumWeight, Integer maximumReps,
        BigDecimal totalVolume, BigDecimal bestEstimatedOneRepMax, long completedSets,
        List<ProgressPoint> history,
        Integer maximumDurationSeconds, BigDecimal maximumAddedWeightKg,
        BigDecimal minimumAssistanceWeightKg, BigDecimal totalDistanceMeters,
        long timedSets, long repetitionSets
) {
    public record ProgressPoint(
            LocalDate date, String exerciseVariantCode, BigDecimal weight,
            Integer reps, BigDecimal volume, BigDecimal estimatedOneRepMax,
            Integer durationSeconds, BigDecimal distanceMeters,
            BigDecimal addedWeightKg, BigDecimal assistanceWeightKg, String loadMode
    ) {}
}
