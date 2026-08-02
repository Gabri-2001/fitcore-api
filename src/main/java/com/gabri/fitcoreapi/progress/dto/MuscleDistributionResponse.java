package com.gabri.fitcoreapi.progress.dto;

import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;

import java.math.BigDecimal;

public record MuscleDistributionResponse(
        MuscleGroup muscleGroup,
        BigDecimal effectiveSets,
        BigDecimal allocatedVolume,
        BigDecimal distributionPercent
) {
}
