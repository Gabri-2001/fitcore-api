package com.gabri.fitcoreapi.progress.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateProgressRecordRequest(
        @DecimalMin("20.00") @DecimalMax("500.00") BigDecimal weightKg,
        @DecimalMin("1.00") @DecimalMax("80.00") BigDecimal bodyFatPercentage,
        @DecimalMin("5.00") @DecimalMax("250.00") BigDecimal muscleMassKg,
        @NotNull LocalDate recordDate,
        @Size(max = 1500) String notes
) {
}
