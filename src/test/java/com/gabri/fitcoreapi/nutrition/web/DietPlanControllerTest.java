package com.gabri.fitcoreapi.nutrition.web;

import com.gabri.fitcoreapi.nutrition.domain.DietPlan;
import com.gabri.fitcoreapi.nutrition.service.DietPlanService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
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
        controllers = DietPlanController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class
        }
)
class DietPlanControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DietPlanService dietPlanService;

    @Test
    @DisplayName("Should create diet plan and return 201")
    void shouldCreateDietPlan() throws Exception {
        DietPlan dietPlan = new DietPlan(
                UUID.randomUUID(),
                "Volume diet",
                "Initial diet",
                1,
                true,
                LocalDate.of(2026, 4, 25),
                null
        );

        ReflectionTestUtils.setField(dietPlan, "id", 30L);

        when(dietPlanService.createDietPlan(any(), any(), any(), any())).thenReturn(dietPlan);

        String requestBody = """
                {
                  "name": "Volume diet",
                  "description": "Initial diet",
                  "startDate": "2026-04-25"
                }
                """;

        mockMvc.perform(post("/api/users/1/diet-plans")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/users/1/diet-plans/30"))
                .andExpect(jsonPath("$.id").value(30))
                .andExpect(jsonPath("$.name").value("Volume diet"))
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @DisplayName("Should return active diet plan")
    void shouldReturnActiveDietPlan() throws Exception {
        DietPlan dietPlan = new DietPlan(
                UUID.randomUUID(),
                "Volume diet",
                "Initial diet",
                1,
                true,
                LocalDate.of(2026, 4, 25),
                null
        );

        ReflectionTestUtils.setField(dietPlan, "id", 30L);

        when(dietPlanService.getActiveDietPlan(1L)).thenReturn(dietPlan);

        mockMvc.perform(get("/api/users/1/diet-plans/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(30))
                .andExpect(jsonPath("$.name").value("Volume diet"))
                .andExpect(jsonPath("$.version").value(1))
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @DisplayName("Should return diet plan history")
    void shouldReturnDietPlanHistory() throws Exception {
        DietPlan dietPlan = new DietPlan(
                UUID.randomUUID(),
                "Volume diet",
                "Initial diet",
                1,
                true,
                LocalDate.of(2026, 4, 25),
                null
        );

        ReflectionTestUtils.setField(dietPlan, "id", 30L);

        when(dietPlanService.getDietPlanHistory(1L)).thenReturn(List.of(dietPlan));

        mockMvc.perform(get("/api/users/1/diet-plans"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(30))
                .andExpect(jsonPath("$[0].name").value("Volume diet"))
                .andExpect(jsonPath("$[0].version").value(1));
    }
}