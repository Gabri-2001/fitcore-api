package com.gabri.fitcoreapi.endurance.dto;

import com.gabri.fitcoreapi.endurance.domain.EnduranceActivity;
import com.gabri.fitcoreapi.endurance.domain.EnduranceLap;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

public record EnduranceActivityResponse(
    Long id,String activityType,String source,Instant startedAt,
    int elapsedSeconds,int movingSeconds,BigDecimal distanceMeters,
    Integer averagePaceSecondsPerKm,BigDecimal averageSpeedKmh,
    BigDecimal elevationGainMeters,Integer averageHeartRate,Integer averageCadence,
    Integer averagePowerWatts,String notes,List<Lap> laps
) {
    public record Lap(int lapNumber,BigDecimal distanceMeters,int durationSeconds,
        Integer averageHeartRate) {
        public static Lap from(EnduranceLap lap) {
            return new Lap(lap.getLapNumber(),lap.getDistanceMeters(),
                lap.getDurationSeconds(),lap.getAverageHeartRate());
        }
    }
    public static EnduranceActivityResponse from(EnduranceActivity a) {
        BigDecimal distance=a.getDistanceMeters();
        Integer pace=null;
        BigDecimal speed=null;
        if(distance.signum()>0) {
            pace=BigDecimal.valueOf(a.getMovingSeconds()).multiply(BigDecimal.valueOf(1000))
                .divide(distance,0,RoundingMode.HALF_UP).intValue();
            speed=distance.multiply(BigDecimal.valueOf(3.6))
                .divide(BigDecimal.valueOf(a.getMovingSeconds()),2,RoundingMode.HALF_UP);
        }
        return new EnduranceActivityResponse(a.getId(),a.getActivityType(),a.getSource(),
            a.getStartedAt(),a.getElapsedSeconds(),a.getMovingSeconds(),
            distance,pace,speed,a.getElevationGainMeters(),a.getAverageHeartRate(),
            a.getAverageCadence(),a.getAveragePowerWatts(),a.getNotes(),
            a.getLaps().stream().map(Lap::from).toList());
    }
}
