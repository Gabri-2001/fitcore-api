package com.gabri.fitcoreapi.nutrition.web;

import com.gabri.fitcoreapi.nutrition.domain.DietPlan;
import com.gabri.fitcoreapi.nutrition.dto.CreateDietPlanRequest;
import com.gabri.fitcoreapi.nutrition.dto.DietPlanResponse;
import com.gabri.fitcoreapi.nutrition.service.DietPlanService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.net.URI;
import java.util.List;

@Tag(name = "Diet Plans", description = "Operations related to diet planning")
@RestController
@RequestMapping("/api/users/{userId}/diet-plans")
public class DietPlanController {

    private final DietPlanService dietPlanService;

    public DietPlanController(DietPlanService dietPlanService) {
        this.dietPlanService = dietPlanService;
    }

    @Operation(summary = "Create a new diet plan for a user")
    @PostMapping
    public ResponseEntity<DietPlanResponse> createDietPlan(
            @Parameter(description = "User id") @PathVariable Long userId,
            @Valid @RequestBody CreateDietPlanRequest request
    ) {
        DietPlan dietPlan = dietPlanService.createDietPlan(
                userId,
                request.getName(),
                request.getDescription(),
                request.getStartDate()
        );

        URI location = URI.create("/api/users/" + userId + "/diet-plans/" + dietPlan.getId());
        return ResponseEntity.created(location).body(DietPlanResponse.from(dietPlan));
    }
    @Operation(summary = "Get the active diet plan of a user")
    @GetMapping("/active")
    public DietPlanResponse getActiveDietPlan(@Parameter(description = "User id") @PathVariable Long userId) {
        return DietPlanResponse.from(dietPlanService.getActiveDietPlan(userId));
    }

    @Operation(summary = "Get diet plan history of a user")
    @GetMapping
    public List<DietPlanResponse> getDietPlanHistory(@Parameter(description = "User id") @PathVariable Long userId) {
        return dietPlanService.getDietPlanHistory(userId)
                .stream()
                .map(DietPlanResponse::from)
                .toList();
    }
}