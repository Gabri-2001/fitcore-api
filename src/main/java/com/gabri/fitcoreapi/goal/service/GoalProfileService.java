package com.gabri.fitcoreapi.goal.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.goal.domain.GoalType;
import com.gabri.fitcoreapi.goal.repository.GoalProfileRepository;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class GoalProfileService {

    private final GoalProfileRepository goalProfileRepository;
    private final UserRepository userRepository;

    public GoalProfileService(GoalProfileRepository goalProfileRepository, UserRepository userRepository) {
        this.goalProfileRepository = goalProfileRepository;
        this.userRepository = userRepository;
    }

    public GoalProfile createGoalProfile(
            Long userId,
            GoalType goalType,
            BigDecimal targetCalories,
            BigDecimal targetProtein,
            BigDecimal targetCarbs,
            BigDecimal targetFats,
            Integer reviewFrequencyDays,
            LocalDate startDate
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        GoalProfile previousActiveProfile = goalProfileRepository.findByUserAndActiveTrue(user).orElse(null);

        int nextVersion = previousActiveProfile == null ? 1 : previousActiveProfile.getVersion() + 1;

        GoalProfile newGoalProfile = new GoalProfile(
                goalType,
                targetCalories,
                targetProtein,
                targetCarbs,
                targetFats,
                reviewFrequencyDays,
                nextVersion,
                true,
                startDate,
                null
        );

        newGoalProfile.setUser(user);

        if (previousActiveProfile != null) {
            previousActiveProfile.deactivate(startDate.minusDays(1));
            newGoalProfile.setPreviousGoalProfile(previousActiveProfile);
        }

        return goalProfileRepository.save(newGoalProfile);
    }

    @Transactional(readOnly = true)
    public GoalProfile getActiveGoalProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return goalProfileRepository.findByUserAndActiveTrue(user)
                .orElseThrow(() -> new ResourceNotFoundException("Active goal profile not found for user id: " + userId));
    }

    @Transactional(readOnly = true)
    public List<GoalProfile> getGoalProfileHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return goalProfileRepository.findByUserOrderByStartDateDesc(user);
    }
}