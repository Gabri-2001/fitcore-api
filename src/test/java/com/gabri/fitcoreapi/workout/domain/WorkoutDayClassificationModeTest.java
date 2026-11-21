package com.gabri.fitcoreapi.workout.domain;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gabri.fitcoreapi.workout.dto.CreateWorkoutDayRequest;
import com.gabri.fitcoreapi.workout.dto.WorkoutDayResponse;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class WorkoutDayClassificationModeTest {
    @Test
    void existingDayDefaultsToManualClassification() {
        WorkoutDay day = new WorkoutDay("Lunes torso", 1, WorkoutDayType.UPPER);
        assertTrue(day.isDayTypeManual());
        assertTrue(WorkoutDayResponse.from(day).dayTypeManual());
        assertEquals(WorkoutDayType.UPPER, day.getDayType());
    }

    @Test
    void aNewAutomaticDayCanRoundTripThroughResponse() {
        WorkoutDay day = new WorkoutDay("Día 2", 2, WorkoutDayType.PUSH);
        day.setDayTypeManual(false);
        WorkoutDayResponse response = WorkoutDayResponse.from(day);
        assertFalse(response.dayTypeManual());
        assertEquals(WorkoutDayType.PUSH, response.dayType());
    }

    @Test
    void oldRequestWithoutClassificationFlagRetainsManualBehavior() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        var day = mapper.readValue("""
            {"name":"Torso","dayOrder":1,"dayType":"UPPER","exercises":[]}
            """, CreateWorkoutDayRequest.class);
        assertTrue(day.isDayTypeManual());
    }

    @Test
    void explicitAutomaticDayFlagIsDeserializedCorrectly() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        var day = mapper.readValue("""
            {"name":"Día automático","dayOrder":1,"dayType":"UPPER",
             "dayTypeManual":false,"exercises":[]}
            """, CreateWorkoutDayRequest.class);
        assertFalse(day.isDayTypeManual());
    }
}
