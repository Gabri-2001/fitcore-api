package com.gabri.fitcoreapi.nutrition.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.common.i18n.MessageResolver;
import com.gabri.fitcoreapi.nutrition.domain.Food;
import com.gabri.fitcoreapi.nutrition.domain.FoodUnit;
import com.gabri.fitcoreapi.nutrition.domain.NutritionLog;
import com.gabri.fitcoreapi.nutrition.domain.NutritionLogMeal;
import com.gabri.fitcoreapi.nutrition.domain.NutritionLogMealFood;
import com.gabri.fitcoreapi.nutrition.repository.NutritionLogMealFoodRepository;
import com.gabri.fitcoreapi.nutrition.repository.NutritionLogRepository;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class NutritionLogMealFoodService {

    private final NutritionLogMealFoodRepository nutritionLogMealFoodRepository;
    private final NutritionLogRepository nutritionLogRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;
    private final MessageResolver messageResolver;

    public NutritionLogMealFoodService(
            NutritionLogMealFoodRepository nutritionLogMealFoodRepository,
            NutritionLogRepository nutritionLogRepository,
            UserRepository userRepository,
            EntityManager entityManager,
            MessageResolver messageResolver
    ) {
        this.nutritionLogMealFoodRepository = nutritionLogMealFoodRepository;
        this.nutritionLogRepository = nutritionLogRepository;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
        this.messageResolver = messageResolver;
    }

    public NutritionLogMealFood addNutritionLogMealFood(
            Long userId,
            Long nutritionLogId,
            Long nutritionLogMealId,
            Long foodId,
            BigDecimal quantity,
            FoodUnit unit,
            BigDecimal calculatedCalories,
            BigDecimal calculatedProtein,
            BigDecimal calculatedCarbs,
            BigDecimal calculatedFats
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.user.notFound", userId)
                ));

        NutritionLog nutritionLog = nutritionLogRepository.findById(nutritionLogId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.nutritionLog.notFound", nutritionLogId)
                ));

        if (!nutritionLog.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException(
                    messageResolver.get("error.nutritionLog.userMismatch", nutritionLogId, userId)
            );
        }

        NutritionLogMeal nutritionLogMeal = entityManager.find(NutritionLogMeal.class, nutritionLogMealId);
        if (nutritionLogMeal == null) {
            throw new ResourceNotFoundException(
                    messageResolver.get("error.nutritionLogMeal.notFound", nutritionLogMealId)
            );
        }

        if (!nutritionLogMeal.getNutritionLog().getId().equals(nutritionLog.getId())) {
            throw new ResourceNotFoundException(
                    messageResolver.get("error.nutritionLogMeal.logMismatch", nutritionLogMealId, nutritionLogId)
            );
        }

        Food food = entityManager.find(Food.class, foodId);
        if (food == null) {
            throw new ResourceNotFoundException(
                    messageResolver.get("error.food.notFound", foodId)
            );
        }

        NutritionLogMealFood mealFood = new NutritionLogMealFood(
                food,
                quantity,
                unit,
                calculatedCalories,
                calculatedProtein,
                calculatedCarbs,
                calculatedFats
        );

        mealFood.setNutritionLogMeal(nutritionLogMeal);

        return nutritionLogMealFoodRepository.save(mealFood);
    }

    @Transactional(readOnly = true)
    public List<NutritionLogMealFood> getNutritionLogMealFoods(
            Long userId,
            Long nutritionLogId,
            Long nutritionLogMealId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.user.notFound", userId)
                ));

        NutritionLog nutritionLog = nutritionLogRepository.findById(nutritionLogId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.nutritionLog.notFound", nutritionLogId)
                ));

        if (!nutritionLog.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException(
                    messageResolver.get("error.nutritionLog.userMismatch", nutritionLogId, userId)
            );
        }

        NutritionLogMeal nutritionLogMeal = entityManager.find(NutritionLogMeal.class, nutritionLogMealId);
        if (nutritionLogMeal == null) {
            throw new ResourceNotFoundException(
                    messageResolver.get("error.nutritionLogMeal.notFound", nutritionLogMealId)
            );
        }

        if (!nutritionLogMeal.getNutritionLog().getId().equals(nutritionLog.getId())) {
            throw new ResourceNotFoundException(
                    messageResolver.get("error.nutritionLogMeal.logMismatch", nutritionLogMealId, nutritionLogId)
            );
        }

        return nutritionLogMealFoodRepository.findByNutritionLogMeal(nutritionLogMeal);
    }
}