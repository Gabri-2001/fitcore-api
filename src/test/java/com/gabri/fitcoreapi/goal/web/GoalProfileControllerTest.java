package com.gabri.fitcoreapi.goal.web;

import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.goal.domain.GoalType;
import com.gabri.fitcoreapi.goal.service.GoalProfileService;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = GoalProfileController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                ValidationAutoConfiguration.class
        }
)
class GoalProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private GoalProfileService goalProfileService;

    @MockitoBean
    private MessageSource messageSource;

    @Test
    @DisplayName("Should create goal profile and return 201")
    void shouldCreateGoalProfile() throws Exception {
        GoalProfile goalProfile = new GoalProfile(
                GoalType.MUSCLE_GAIN,
                new BigDecimal("3000"),
                new BigDecimal("180"),
                new BigDecimal("350"),
                new BigDecimal("80"),
                14,
                1,
                true,
                LocalDate.of(2026, 4, 25),
                null
        );

        ReflectionTestUtils.setField(goalProfile, "id", 10L);

        when(goalProfileService.createGoalProfile(any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(goalProfile);

        String requestBody = """
                {
                  "goalType": "MUSCLE_GAIN",
                  "targetCalories": 3000,
                  "targetProtein": 180,
                  "targetCarbs": 350,
                  "targetFats": 80,
                  "reviewFrequencyDays": 14,
                  "startDate": "2026-04-25"
                }
                """;

        mockMvc.perform(post("/api/users/1/goal-profiles")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/users/1/goal-profiles/10"))
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.goalType").value("MUSCLE_GAIN"))
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @DisplayName("Should return active goal profile")
    void shouldReturnActiveGoalProfile() throws Exception {
        GoalProfile goalProfile = new GoalProfile(
                GoalType.MUSCLE_GAIN,
                new BigDecimal("3000"),
                new BigDecimal("180"),
                new BigDecimal("350"),
                new BigDecimal("80"),
                14,
                1,
                true,
                LocalDate.of(2026, 4, 25),
                null
        );

        when(goalProfileService.getActiveGoalProfile(1L)).thenReturn(goalProfile);

        mockMvc.perform(get("/api/users/1/goal-profiles/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.goalType").value("MUSCLE_GAIN"))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @DisplayName("Should return goal profile history")
    void shouldReturnGoalProfileHistory() throws Exception {
        GoalProfile goalProfile = new GoalProfile(
                GoalType.MUSCLE_GAIN,
                new BigDecimal("3000"),
                new BigDecimal("180"),
                new BigDecimal("350"),
                new BigDecimal("80"),
                14,
                1,
                true,
                LocalDate.of(2026, 4, 25),
                null
        );

        when(goalProfileService.getGoalProfileHistory(1L)).thenReturn(List.of(goalProfile));

        mockMvc.perform(get("/api/users/1/goal-profiles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].goalType").value("MUSCLE_GAIN"));
    }
}
