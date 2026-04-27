package com.gabri.fitcoreapi.workout.web;

import com.gabri.fitcoreapi.workout.domain.WorkoutPlan;
import com.gabri.fitcoreapi.workout.service.WorkoutPlanService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.validation.ValidationAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.MessageSource;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = WorkoutPlanController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                ValidationAutoConfiguration.class
        }
)
class WorkoutPlanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WorkoutPlanService workoutPlanService;

    @MockitoBean
    private MessageSource messageSource;

    @Test
    @DisplayName("Should create workout plan and return 201")
    void shouldCreateWorkoutPlan() throws Exception {
        WorkoutPlan workoutPlan = new WorkoutPlan(
                UUID.randomUUID(),
                "Push Pull Legs",
                "Initial plan",
                1,
                true,
                LocalDate.of(2026, 4, 25),
                null
        );

        ReflectionTestUtils.setField(workoutPlan, "id", 20L);

        when(workoutPlanService.createWorkoutPlan(any(), any(), any(), any())).thenReturn(workoutPlan);

        String requestBody = """
                {
                  "name": "Push Pull Legs",
                  "description": "Initial plan",
                  "startDate": "2026-04-25"
                }
                """;

        mockMvc.perform(post("/api/users/1/workout-plans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/users/1/workout-plans/20"))
                .andExpect(jsonPath("$.id").value(20))
                .andExpect(jsonPath("$.name").value("Push Pull Legs"))
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @DisplayName("Should return active workout plan")
    void shouldReturnActiveWorkoutPlan() throws Exception {
        WorkoutPlan workoutPlan = new WorkoutPlan(
                UUID.randomUUID(),
                "Push Pull Legs",
                "Initial plan",
                1,
                true,
                LocalDate.of(2026, 4, 25),
                null
        );

        when(workoutPlanService.getActiveWorkoutPlan(1L)).thenReturn(workoutPlan);

        mockMvc.perform(get("/api/users/1/workout-plans/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Push Pull Legs"))
                .andExpect(jsonPath("$.version").value(1));
    }

    @Test
    @DisplayName("Should return workout plan history")
    void shouldReturnWorkoutPlanHistory() throws Exception {
        WorkoutPlan workoutPlan = new WorkoutPlan(
                UUID.randomUUID(),
                "Push Pull Legs",
                "Initial plan",
                1,
                true,
                LocalDate.of(2026, 4, 25),
                null
        );

        when(workoutPlanService.getWorkoutPlanHistory(1L)).thenReturn(List.of(workoutPlan));

        mockMvc.perform(get("/api/users/1/workout-plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Push Pull Legs"));
    }
}
