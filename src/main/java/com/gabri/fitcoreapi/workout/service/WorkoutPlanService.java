package com.gabri.fitcoreapi.workout.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.exercise.repository.ExerciseVariantRepository;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.*;
import com.gabri.fitcoreapi.workout.dto.CreateWorkoutDayRequest;
import com.gabri.fitcoreapi.workout.dto.WorkoutDayResponse;
import com.gabri.fitcoreapi.workout.dto.WorkoutPlanDetailResponse;
import com.gabri.fitcoreapi.workout.repository.WorkoutDayRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutExerciseRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.HashSet;
import java.util.UUID;

@Service
@Transactional
public class WorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final UserRepository userRepository;
    private final ExerciseVariantRepository exerciseVariantRepository;
    private final WorkoutDayRepository workoutDayRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;

    public WorkoutPlanService(WorkoutPlanRepository workoutPlanRepository, UserRepository userRepository,
            ExerciseVariantRepository exerciseVariantRepository, WorkoutDayRepository workoutDayRepository,
            WorkoutExerciseRepository workoutExerciseRepository) {
        this.workoutPlanRepository = workoutPlanRepository;
        this.userRepository = userRepository;
        this.exerciseVariantRepository = exerciseVariantRepository;
        this.workoutDayRepository = workoutDayRepository;
        this.workoutExerciseRepository = workoutExerciseRepository;
    }

    public WorkoutPlan createWorkoutPlan(
            Long userId,
            String name,
            String description,
            LocalDate startDate
    ) {
        return createWorkoutPlan(userId, name, description, startDate, List.of());
    }

    public WorkoutPlan createWorkoutPlan(
            Long userId,
            String name,
            String description,
            LocalDate startDate,
            List<CreateWorkoutDayRequest> dayRequests
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

        addStructure(newPlan, dayRequests == null ? List.of() : dayRequests);

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

    @Transactional(readOnly = true)
    public WorkoutPlanDetailResponse getWorkoutPlanDetail(Long userId, Long workoutPlanId) {
        return WorkoutPlanDetailResponse.from(getWorkoutPlanById(userId, workoutPlanId));
    }

    public WorkoutDayResponse reorderExercises(Long userId, Long workoutPlanId, Long workoutDayId,
            List<Long> orderedExerciseIds) {
        WorkoutPlan plan = getWorkoutPlanById(userId, workoutPlanId);
        if (!plan.isActive()) {
            throw new BusinessRuleException("Only an active workout plan can be reordered");
        }

        WorkoutDay day = workoutDayRepository.findByIdAndWorkoutPlanIdAndWorkoutPlanUserId(
                        workoutDayId, workoutPlanId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout day not found with id: " + workoutDayId));
        List<WorkoutExercise> current = workoutExerciseRepository.findByWorkoutDayOrderByExerciseOrder(day);

        if (orderedExerciseIds == null || orderedExerciseIds.size() != current.size()
                || new HashSet<>(orderedExerciseIds).size() != current.size()
                || !new HashSet<>(orderedExerciseIds).equals(current.stream()
                        .map(WorkoutExercise::getId).collect(java.util.stream.Collectors.toSet()))) {
            throw new BusinessRuleException("The order must contain every workout exercise exactly once");
        }

        var byId = current.stream().collect(java.util.stream.Collectors.toMap(WorkoutExercise::getId, value -> value));
        for (int index = 0; index < orderedExerciseIds.size(); index++) {
            byId.get(orderedExerciseIds.get(index)).changeOrder(index + 1);
        }
        workoutExerciseRepository.saveAll(current);
        day.getWorkoutExercises().sort(java.util.Comparator.comparing(WorkoutExercise::getExerciseOrder));
        return WorkoutDayResponse.from(day);
    }

    public WorkoutPlan reviseWorkoutPlan(Long userId, Long workoutPlanId, String name,
            String description, LocalDate effectiveDate, List<CreateWorkoutDayRequest> dayRequests) {
        WorkoutPlan current = getWorkoutPlanById(userId, workoutPlanId);
        if (!current.isActive()) {
            throw new BusinessRuleException("Only the active workout plan can be revised");
        }
        if (effectiveDate.isBefore(current.getStartDate())) {
            throw new BusinessRuleException("The revised plan cannot start before the current plan");
        }

        current.deactivate(endDateBefore(effectiveDate, current.getStartDate()));
        WorkoutPlan revised = new WorkoutPlan(current.getPlanGroupId(), name, description,
                current.getVersion() + 1, true, effectiveDate, null);
        revised.setUser(current.getUser());
        revised.setPreviousPlan(current);
        addStructure(revised, dayRequests == null ? List.of() : dayRequests);
        return workoutPlanRepository.save(revised);
    }

    public WorkoutPlan duplicateWorkoutPlan(Long userId, Long workoutPlanId, String name, LocalDate startDate) {
        WorkoutPlan source = getWorkoutPlanById(userId, workoutPlanId);
        WorkoutPlan active = workoutPlanRepository.findByUserAndActiveTrue(source.getUser()).orElse(null);
        if (active != null) {
            active.deactivate(endDateBefore(startDate, active.getStartDate()));
        }

        WorkoutPlan duplicate = new WorkoutPlan(UUID.randomUUID(), name, source.getDescription(),
                1, true, startDate, null);
        duplicate.setUser(source.getUser());
        copyStructure(source, duplicate);
        return workoutPlanRepository.save(duplicate);
    }

    private LocalDate endDateBefore(LocalDate newStartDate, LocalDate oldStartDate) {
        return newStartDate.isAfter(oldStartDate) ? newStartDate.minusDays(1) : oldStartDate;
    }

    private void copyStructure(WorkoutPlan source, WorkoutPlan target) {
        source.getWorkoutDays().stream()
                .sorted(java.util.Comparator.comparing(WorkoutDay::getDayOrder))
                .forEach(sourceDay -> {
                    WorkoutDay day = new WorkoutDay(sourceDay.getName(), sourceDay.getDayOrder(), sourceDay.getDayType());
                    sourceDay.getWorkoutExercises().stream()
                            .sorted(java.util.Comparator.comparing(WorkoutExercise::getExerciseOrder))
                            .forEach(sourceExercise -> day.addWorkoutExercise(new WorkoutExercise(
                                    sourceExercise.getExerciseVariant(), sourceExercise.getSets(), sourceExercise.getReps(),
                                    sourceExercise.getRestSeconds(), sourceExercise.getExerciseOrder())));
                    target.addWorkoutDay(day);
                });
    }

    private void addStructure(WorkoutPlan plan, List<CreateWorkoutDayRequest> dayRequests) {
        var dayOrders = new HashSet<Integer>();
        for (CreateWorkoutDayRequest dayRequest : dayRequests) {
            if (!dayOrders.add(dayRequest.getDayOrder())) {
                throw new BusinessRuleException("Workout day order must be unique within a plan");
            }
            WorkoutDay day = new WorkoutDay(dayRequest.getName(), dayRequest.getDayOrder(), dayRequest.getDayType());
            var exerciseOrders = new HashSet<Integer>();
            for (var exerciseRequest : dayRequest.getExercises()) {
                if (!exerciseOrders.add(exerciseRequest.getExerciseOrder())) {
                    throw new BusinessRuleException("Exercise order must be unique within a workout day");
                }
                var variant = exerciseVariantRepository.findByCodeAndActiveTrue(exerciseRequest.getExerciseVariantCode())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Exercise variant not found with code: " + exerciseRequest.getExerciseVariantCode()));
                day.addWorkoutExercise(new WorkoutExercise(
                        variant, exerciseRequest.getSets(), exerciseRequest.getReps(),
                        exerciseRequest.getRestSeconds(), exerciseRequest.getExerciseOrder()
                ));
            }
            plan.addWorkoutDay(day);
        }
    }
}
