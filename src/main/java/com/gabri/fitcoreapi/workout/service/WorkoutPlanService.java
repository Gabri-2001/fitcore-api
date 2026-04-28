package com.gabri.fitcoreapi.workout.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.WorkoutPlan;
import com.gabri.fitcoreapi.workout.repository.WorkoutPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class WorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final UserRepository userRepository;

    public WorkoutPlanService(WorkoutPlanRepository workoutPlanRepository, UserRepository userRepository) {
        this.workoutPlanRepository = workoutPlanRepository;
        this.userRepository = userRepository;
    }

    public WorkoutPlan createWorkoutPlan(
            Long userId,
            String name,
            String description,
            LocalDate startDate
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        WorkoutPlan previousActivePlan = workoutPlanRepository.findByUserAndActiveTrue(user).orElse(null);

        UUID planGroupId = previousActivePlan == null
                ? UUID.randomUUID()
                : previousActivePlan.getPlanGroupId();

        int nextVersion = previousActivePlan == null
                ? 1
                : previousActivePlan.getVersion() + 1;

        WorkoutPlan newPlan = new WorkoutPlan(
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

        return workoutPlanRepository.save(newPlan);
    }

    @Transactional(readOnly = true)
    public WorkoutPlan getActiveWorkoutPlan(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return workoutPlanRepository.findByUserAndActiveTrue(user)
                .orElseThrow(() -> new ResourceNotFoundException("Active workout plan not found for user id: " + userId));
    }

    @Transactional(readOnly = true)
    public List<WorkoutPlan> getWorkoutPlanHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return workoutPlanRepository.findByUserOrderByStartDateDesc(user);
    }

    @Transactional(readOnly = true)
    public WorkoutPlan getWorkoutPlanById(Long userId, Long workoutPlanId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return workoutPlanRepository.findByIdAndUser(workoutPlanId, user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workout plan not found with id: " + workoutPlanId + " for user id: " + userId
                ));
    }
}