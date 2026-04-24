package com.gabri.fitcoreapi.nutrition.web;

import com.gabri.fitcoreapi.nutrition.domain.NutritionLogMealFood;
import com.gabri.fitcoreapi.nutrition.dto.CreateNutritionLogMealFoodRequest;
import com.gabri.fitcoreapi.nutrition.dto.NutritionLogMealFoodResponse;
import com.gabri.fitcoreapi.nutrition.service.NutritionLogMealFoodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/nutrition-logs/{nutritionLogId}/meals/{nutritionLogMealId}/foods")
public class NutritionLogMealFoodController {

    private final NutritionLogMealFoodService nutritionLogMealFoodService;

    public NutritionLogMealFoodController(NutritionLogMealFoodService nutritionLogMealFoodService) {
        this.nutritionLogMealFoodService = nutritionLogMealFoodService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NutritionLogMealFoodResponse addNutritionLogMealFood(
            @PathVariable Long userId,
            @PathVariable Long nutritionLogId,
            @PathVariable Long nutritionLogMealId,
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

    @GetMapping
    public List<NutritionLogMealFoodResponse> getNutritionLogMealFoods(
            @PathVariable Long userId,
            @PathVariable Long nutritionLogId,
            @PathVariable Long nutritionLogMealId
    ) {
        return nutritionLogMealFoodService.getNutritionLogMealFoods(userId, nutritionLogId, nutritionLogMealId)
                .stream()
                .map(NutritionLogMealFoodResponse::from)
                .toList();
    }
}