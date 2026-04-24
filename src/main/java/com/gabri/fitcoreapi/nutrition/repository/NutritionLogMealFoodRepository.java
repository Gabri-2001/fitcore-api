package com.gabri.fitcoreapi.nutrition.repository;

import com.gabri.fitcoreapi.nutrition.domain.NutritionLogMeal;
import com.gabri.fitcoreapi.nutrition.domain.NutritionLogMealFood;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NutritionLogMealFoodRepository extends JpaRepository<NutritionLogMealFood, Long> {

    List<NutritionLogMealFood> findByNutritionLogMeal(NutritionLogMeal nutritionLogMeal);
}
