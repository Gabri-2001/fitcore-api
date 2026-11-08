package com.gabri.fitcoreapi.workout.domain;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class WorkoutSessionLifecycleTest {

    @Test
    void completesAnInProgressSessionWithDuration() {
        WorkoutSession session = session(60);

        session.complete(Instant.parse("2026-11-08T12:00:00Z"));

        assertEquals(WorkoutSessionStatus.COMPLETED, session.getStatus());
        assertNotNull(session.getCompletedAt());
        assertFalse(session.isEditable());
        assertThrows(IllegalStateException.class, session::cancel);
    }

    @Test
    void rejectsCompletingASessionWithoutDuration() {
        WorkoutSession session = session(null);

        assertThrows(IllegalStateException.class, () -> session.complete(Instant.now()));
        assertEquals(WorkoutSessionStatus.IN_PROGRESS, session.getStatus());
    }

    @Test
    void cancelsAnInProgressSession() {
        WorkoutSession session = session(30);

        session.cancel();

        assertEquals(WorkoutSessionStatus.CANCELLED, session.getStatus());
        assertFalse(session.isEditable());
    }

    private WorkoutSession session(Integer duration) {
        return new WorkoutSession(LocalDate.of(2026, 11, 8), WorkoutSessionCategory.STRENGTH,
                WorkoutSessionIntensity.MODERATE, duration, null, null);
    }
}
