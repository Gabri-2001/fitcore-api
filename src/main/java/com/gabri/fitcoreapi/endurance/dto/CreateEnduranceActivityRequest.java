package com.gabri.fitcoreapi.endurance.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record CreateEnduranceActivityRequest(
    @NotBlank @Pattern(regexp="RUN|TRAIL_RUN|TREADMILL|WALK|BIKE") String activityType,
    @NotNull Instant startedAt,
    @NotNull @Min(1) Integer elapsedSeconds,
    @NotNull @Min(1) Integer movingSeconds,
    @NotNull @DecimalMin("0.0") BigDecimal distanceMeters,
    @DecimalMin("0.0") BigDecimal elevationGainMeters,
    @Min(20) @Max(260) Integer averageHeartRate,
    @Min(0) Integer averageCadence,
    @Min(0) Integer averagePowerWatts,
    @Size(max=1500) String notes,
    @Valid List<EnduranceLapRequest> laps
) {
    public record EnduranceLapRequest(
        @NotNull @Min(1) Integer lapNumber,
        @NotNull @DecimalMin("0.0") BigDecimal distanceMeters,
        @NotNull @Min(1) Integer durationSeconds,
        @Min(20) @Max(260) Integer averageHeartRate
    ) {}
}
