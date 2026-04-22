package com.gabri.fitcoreapi.nutrition.web;

import com.gabri.fitcoreapi.nutrition.domain.DietPlan;
import com.gabri.fitcoreapi.nutrition.dto.CreateDietPlanRequest;
import com.gabri.fitcoreapi.nutrition.dto.DietPlanResponse;
import com.gabri.fitcoreapi.nutrition.service.DietPlanService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/diet-plans")
public class DietPlanController {

    private final DietPlanService dietPlanService;

    public DietPlanController(DietPlanService dietPlanService) {
        this.dietPlanService = dietPlanService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DietPlanResponse createDietPlan(
            @PathVariable Long userId,
            @RequestBody CreateDietPlanRequest request
    ) {
        DietPlan dietPlan = dietPlanService.createDietPlan(
                userId,
                request.getName(),
                request.getDescription(),
                request.getStartDate()
        );

        return DietPlanResponse.from(dietPlan);
    }

    @GetMapping("/active")
    public DietPlanResponse getActiveDietPlan(@PathVariable Long userId) {
        return DietPlanResponse.from(dietPlanService.getActiveDietPlan(userId));
    }

    @GetMapping
    public List<DietPlanResponse> getDietPlanHistory(@PathVariable Long userId) {
        return dietPlanService.getDietPlanHistory(userId)
                .stream()
                .map(DietPlanResponse::from)
                .toList();
    }
}