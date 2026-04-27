package com.gabri.fitcoreapi.workout.web;

import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionCategory;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionIntensity;
import com.gabri.fitcoreapi.workout.service.WorkoutSessionService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = WorkoutSessionController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class
        }
)
class WorkoutSessionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WorkoutSessionService workoutSessionService;

    @Test
    @DisplayName("Should create workout session and return 201")
    void shouldCreateWorkoutSession() throws Exception {
        WorkoutSession workoutSession = new WorkoutSession(
                LocalDate.of(2026, 4, 25),
                WorkoutSessionCategory.STRENGTH,
                WorkoutSessionIntensity.MODERATE,
                75,
                "Good session",
                new BigDecimal("420.00")
        );

        ReflectionTestUtils.setField(workoutSession, "id", 40L);

        when(workoutSessionService.createWorkoutSession(any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(workoutSession);

        String requestBody = """
                {
                  "workoutDayId": 5,
                  "sessionDate": "2026-04-25",
                  "sessionCategory": "STRENGTH",
                  "sessionIntensity": "MODERATE",
                  "durationMinutes": 75,
                  "notes": "Good session",
                  "estimatedTotalCaloriesBurned": 420.00
                }
                """;

        mockMvc.perform(post("/api/users/1/workout-sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/users/1/workout-sessions/40"))
                .andExpect(jsonPath("$.id").value(40))
                .andExpect(jsonPath("$.sessionDate").value("2026-04-25"))
                .andExpect(jsonPath("$.sessionCategory").value("STRENGTH"))
                .andExpect(jsonPath("$.sessionIntensity").value("MODERATE"))
                .andExpect(jsonPath("$.durationMinutes").value(75));
    }

    @Test
    @DisplayName("Should return workout sessions")
    void shouldReturnWorkoutSessions() throws Exception {
        WorkoutSession workoutSession = new WorkoutSession(
                LocalDate.of(2026, 4, 25),
                WorkoutSessionCategory.STRENGTH,
                WorkoutSessionIntensity.MODERATE,
                75,
                "Good session",
                new BigDecimal("420.00")
        );

        ReflectionTestUtils.setField(workoutSession, "id", 40L);

        when(workoutSessionService.getWorkoutSessionsByUser(1L)).thenReturn(List.of(workoutSession));

        mockMvc.perform(get("/api/users/1/workout-sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(40))
                .andExpect(jsonPath("$[0].sessionDate").value("2026-04-25"))
                .andExpect(jsonPath("$[0].sessionCategory").value("STRENGTH"));
    }

    @Test
    @DisplayName("Should return workout sessions filtered by date range")
    void shouldReturnWorkoutSessionsByDateRange() throws Exception {
        WorkoutSession workoutSession = new WorkoutSession(
                LocalDate.of(2026, 4, 25),
                WorkoutSessionCategory.STRENGTH,
                WorkoutSessionIntensity.MODERATE,
                75,
                "Good session",
                new BigDecimal("420.00")
        );

        ReflectionTestUtils.setField(workoutSession, "id", 40L);

        when(workoutSessionService.getWorkoutSessionsByUserAndDateRange(
                1L,
                LocalDate.of(2026, 4, 1),
                LocalDate.of(2026, 4, 30)
        )).thenReturn(List.of(workoutSession));

        mockMvc.perform(get("/api/users/1/workout-sessions")
                        .param("startDate", "2026-04-01")
                        .param("endDate", "2026-04-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(40))
                .andExpect(jsonPath("$[0].sessionDate").value("2026-04-25"))
                .andExpect(jsonPath("$[0].sessionCategory").value("STRENGTH"));
    }
}