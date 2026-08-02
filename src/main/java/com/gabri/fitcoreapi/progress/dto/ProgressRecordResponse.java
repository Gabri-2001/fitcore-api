package com.gabri.fitcoreapi.progress.dto;

import com.gabri.fitcoreapi.progress.domain.ProgressRecord;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProgressRecordResponse(
        Long id,
        BigDecimal weightKg,
        BigDecimal bodyFatPercentage,
        BigDecimal muscleMassKg,
        LocalDate recordDate,
        String notes
) {
    public static ProgressRecordResponse from(ProgressRecord value) {
        return new ProgressRecordResponse(value.getId(), value.getWeightKg(), value.getBodyFatPercentage(),
                value.getMuscleMassKg(), value.getRecordDate(), value.getNotes());
    }
}
