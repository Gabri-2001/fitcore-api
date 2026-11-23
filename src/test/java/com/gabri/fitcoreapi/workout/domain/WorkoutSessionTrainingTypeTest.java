package com.gabri.fitcoreapi.workout.domain;

import com.gabri.fitcoreapi.workout.dto.WorkoutSessionResponse;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;

class WorkoutSessionTrainingTypeTest {

    private WorkoutSession session() {
        return new WorkoutSession(LocalDate.of(2026, 11, 22),
                WorkoutSessionCategory.MIXED, WorkoutSessionIntensity.MODERATE,
                null, null, null);
    }

    @Test
    void newSessionsCanHaveAutomaticOrManualType() {
        WorkoutSession workout = session();
        assertNull(workout.getTrainingDayType());
        assertFalse(workout.isTrainingDayTypeManual());
        workout.setTrainingDayClassification(WorkoutDayType.PULL, false);
        assertEquals(WorkoutDayType.PULL, workout.getTrainingDayType());
        assertFalse(workout.isTrainingDayTypeManual());
        workout.setTrainingDayClassification(WorkoutDayType.ARMS, true);
        assertEquals(WorkoutDayType.ARMS, workout.getTrainingDayType());
        assertTrue(workout.isTrainingDayTypeManual());
        WorkoutSessionResponse response = WorkoutSessionResponse.from(workout);
        assertEquals(WorkoutDayType.ARMS, response.getTrainingDayType());
        assertTrue(response.isTrainingDayTypeManual());
    }

    @Test
    void restCannotBeChosenAsAnActualTrainingSession() {
        WorkoutSession workout = session();
        assertThrows(IllegalArgumentException.class,
                () -> workout.setTrainingDayClassification(WorkoutDayType.REST, true));
        assertNull(workout.getTrainingDayType());
    }

    @Test
    void historyKeepsSessionCategorySeparateFromMuscleType() {
        WorkoutSession workout = session();
        workout.setTrainingDayClassification(WorkoutDayType.CORE, true);
        assertEquals(WorkoutSessionCategory.MIXED, workout.getSessionCategory());
        assertEquals(WorkoutSessionIntensity.MODERATE, workout.getSessionIntensity());
        assertEquals(WorkoutDayType.CORE, workout.getTrainingDayType());
    }
}
