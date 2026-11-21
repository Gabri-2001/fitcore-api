package com.gabri.fitcoreapi.endurance.dto;

import com.gabri.fitcoreapi.endurance.domain.EnduranceActivity;
import com.gabri.fitcoreapi.endurance.domain.EnduranceLap;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;

class EnduranceActivityResponseTest {
 @Test void computesPaceAndSpeedFromMovingTimeAndDistance() {
    var activity=new EnduranceActivity(null,"RUN",Instant.parse("2026-11-21T12:00:00Z"),
        1980,1800,new BigDecimal("5000"),null,142,170,null,null);
    activity.addLap(new EnduranceLap(1,new BigDecimal("1000"),365,140));
    var dto=EnduranceActivityResponse.from(activity);
    assertEquals(360,dto.averagePaceSecondsPerKm());
    assertEquals(0,dto.averageSpeedKmh().compareTo(new BigDecimal("10.00")));
    assertEquals(1,dto.laps().size());
    assertEquals(1980,dto.elapsedSeconds());
 }
}
