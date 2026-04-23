package com.gabri.fitcoreapi.nutrition.service;

import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.common.i18n.MessageResolver;
import com.gabri.fitcoreapi.nutrition.domain.DietDay;
import com.gabri.fitcoreapi.nutrition.domain.NutritionLog;
import com.gabri.fitcoreapi.nutrition.domain.NutritionLogMeal;
import com.gabri.fitcoreapi.nutrition.domain.PlannedMeal;
import com.gabri.fitcoreapi.nutrition.dto.CreateNutritionLogMealRequest;
import com.gabri.fitcoreapi.nutrition.repository.NutritionLogRepository;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class NutritionLogService {

    private final NutritionLogRepository nutritionLogRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;
    private final MessageResolver messageResolver;

    public NutritionLogService(
            NutritionLogRepository nutritionLogRepository,
            UserRepository userRepository,
            EntityManager entityManager,
            MessageResolver messageResolver
    ) {
        this.nutritionLogRepository = nutritionLogRepository;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
        this.messageResolver = messageResolver;
    }

    public NutritionLog createNutritionLog(
            Long userId,
            Long dietDayId,
            LocalDate logDate,
            List<CreateNutritionLogMealRequest> mealRequests
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.user.notFound", userId)
                ));

        if (nutritionLogRepository.findByUserAndLogDate(user, logDate).isPresent()) {
            throw new BusinessRuleException(
                    messageResolver.get("error.nutritionLog.alreadyExists", userId, logDate)
            );
        }

        NutritionLog nutritionLog = new NutritionLog(logDate);
        nutritionLog.setUser(user);

        if (dietDayId != null) {
            DietDay dietDay = entityManager.find(DietDay.class, dietDayId);

            if (dietDay == null) {
                throw new ResourceNotFoundException(
                        messageResolver.get("error.dietDay.notFound", dietDayId)
                );
            }

            nutritionLog.setDietDay(dietDay);
        }

        for (CreateNutritionLogMealRequest mealRequest : mealRequests) {
            NutritionLogMeal meal = new NutritionLogMeal(
                    mealRequest.getMealName(),
                    mealRequest.getMealType(),
                    mealRequest.getSourceType(),
                    mealRequest.getMealOrder(),
                    mealRequest.getNotes(),
                    mealRequest.getTotalCalories(),
                    mealRequest.getTotalProtein(),
                    mealRequest.getTotalCarbs(),
                    mealRequest.getTotalFats()
            );

            if (mealRequest.getPlannedMealId() != null) {
                PlannedMeal plannedMeal = entityManager.find(PlannedMeal.class, mealRequest.getPlannedMealId());

                if (plannedMeal == null) {
                    throw new ResourceNotFoundException(
                            messageResolver.get("error.plannedMeal.notFound", mealRequest.getPlannedMealId())
                    );
                }

                meal.setPlannedMeal(plannedMeal);
            }

            nutritionLog.addMeal(meal);
        }

        return nutritionLogRepository.save(nutritionLog);
    }

    @Transactional(readOnly = true)
    public List<NutritionLog> getNutritionLogsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.user.notFound", userId)
                ));

        return nutritionLogRepository.findByUserOrderByLogDateDesc(user);
    }

    @Transactional(readOnly = true)
    public NutritionLog getNutritionLogByUserAndDate(Long userId, LocalDate logDate) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.user.notFound", userId)
                ));

        return nutritionLogRepository.findByUserAndLogDate(user, logDate)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.nutritionLog.notFound", logDate)
                ));
    }
}
