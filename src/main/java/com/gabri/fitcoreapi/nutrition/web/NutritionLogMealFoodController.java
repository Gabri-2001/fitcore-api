package com.gabri.fitcoreapi.nutrition.web;

import com.gabri.fitcoreapi.nutrition.domain.NutritionLogMealFood;
import com.gabri.fitcoreapi.nutrition.dto.CreateNutritionLogMealFoodRequest;
import com.gabri.fitcoreapi.nutrition.dto.NutritionLogMealFoodResponse;
import com.gabri.fitcoreapi.nutrition.service.NutritionLogMealFoodService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Nutrition Log Meal Foods",
        description = "Operations related to foods consumed inside a real nutrition log meal"
)
@RestController
@RequestMapping("/api/users/{userId}/nutrition-logs/{nutritionLogId}/meals/{nutritionLogMealId}/foods")
public class NutritionLogMealFoodController {

    private final NutritionLogMealFoodService nutritionLogMealFoodService;

    public NutritionLogMealFoodController(NutritionLogMealFoodService nutritionLogMealFoodService) {
        this.nutritionLogMealFoodService = nutritionLogMealFoodService;
    }

    @Operation(summary = "Add a consumed food to a nutrition log meal")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NutritionLogMealFoodResponse addNutritionLogMealFood(
            @Parameter(description = "User id") @PathVariable Long userId,
            @Parameter(description = "Nutrition log id") @PathVariable Long nutritionLogId,
            @Parameter(description = "Nutrition log meal id") @PathVariable Long nutritionLogMealId,
            @Valid @RequestBody CreateNutritionLogMealFoodRequest request
    ) {
        NutritionLogMealFood mealFood = nutritionLogMealFoodService.addNutritionLogMealFood(
                userId,
                nutritionLogId,
                nutritionLogMealId,
                request.getFoodId(),
                request.getQuantity(),
                request.getUnit(),
                request.getCalculatedCalories(),
                request.getCalculatedProtein(),
                request.getCalculatedCarbs(),
                request.getCalculatedFats()
        );

        return NutritionLogMealFoodResponse.from(mealFood);
    }

    @Operation(summary = "Get all consumed foods of a nutrition log meal")
    @GetMapping
    public List<NutritionLogMealFoodResponse> getNutritionLogMealFoods(
            @Parameter(description = "User id") @PathVariable Long userId,
            @Parameter(description = "Nutrition log id") @PathVariable Long nutritionLogId,
            @Parameter(description = "Nutrition log meal id") @PathVariable Long nutritionLogMealId
    ) {
        return nutritionLogMealFoodService.getNutritionLogMealFoods(userId, nutritionLogId, nutritionLogMealId)
                .stream()
                .map(NutritionLogMealFoodResponse::from)
                .toList();
    }
}