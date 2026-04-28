package com.gabri.fitcoreapi.nutrition.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.nutrition.domain.DietPlan;
import com.gabri.fitcoreapi.nutrition.repository.DietPlanRepository;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DietPlanService {

    private final DietPlanRepository dietPlanRepository;
    private final UserRepository userRepository;

    public DietPlanService(DietPlanRepository dietPlanRepository, UserRepository userRepository) {
        this.dietPlanRepository = dietPlanRepository;
        this.userRepository = userRepository;
    }

    public DietPlan createDietPlan(
            Long userId,
            String name,
            String description,
            LocalDate startDate
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        DietPlan previousActivePlan = dietPlanRepository.findByUserAndActiveTrue(user).orElse(null);

        UUID planGroupId = previousActivePlan == null
                ? UUID.randomUUID()
                : previousActivePlan.getPlanGroupId();

        int nextVersion = previousActivePlan == null
                ? 1
                : previousActivePlan.getVersion() + 1;

        DietPlan newPlan = new DietPlan(
                planGroupId,
                name,
                description,
                nextVersion,
                true,
                startDate,
                null
        );

        newPlan.setUser(user);

        if (previousActivePlan != null) {
            previousActivePlan.deactivate(startDate.minusDays(1));
            newPlan.setPreviousPlan(previousActivePlan);
        }

        return dietPlanRepository.save(newPlan);
    }

    @Transactional(readOnly = true)
    public DietPlan getActiveDietPlan(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return dietPlanRepository.findByUserAndActiveTrue(user)
                .orElseThrow(() -> new ResourceNotFoundException("Active diet plan not found for user id: " + userId));
    }

    @Transactional(readOnly = true)
    public List<DietPlan> getDietPlanHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return dietPlanRepository.findByUserOrderByStartDateDesc(user);
    }

    @Transactional(readOnly = true)
    public DietPlan getDietPlanById(Long userId, Long dietPlanId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return dietPlanRepository.findByIdAndUser(dietPlanId, user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Diet plan not found with id: " + dietPlanId + " for user id: " + userId
                ));
    }
}