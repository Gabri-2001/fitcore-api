package com.gabri.fitcoreapi.workout.domain;

import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import static org.assertj.core.api.Assertions.assertThat;

class ExerciseSetLogTest {
    @Test
    void shouldCalculateEstimatedOneRepMaxUsingEpleyFormula() {
        ExerciseSetLog log = new ExerciseSetLog(null, 1, new BigDecimal("100.00"), 10, 2,
                new BigDecimal("8.0"), true, null);
        assertThat(log.estimatedOneRepMax()).isEqualByComparingTo("133.33330000");
    }

    @Test
    void shouldReturnZeroForIncompleteSet() {
        ExerciseSetLog log = new ExerciseSetLog(null, 1, new BigDecimal("100.00"), 10, null, null, false, null);
        assertThat(log.estimatedOneRepMax()).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
