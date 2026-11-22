package com.gabri.fitcoreapi.workout.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.common.i18n.MessageResolver;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.WorkoutDay;
import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionCategory;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionIntensity;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionStatus;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import com.gabri.fitcoreapi.workout.domain.WorkoutExercise;
import com.gabri.fitcoreapi.workout.domain.ExerciseSetLog;
import com.gabri.fitcoreapi.workout.domain.WorkoutMuscleSelectionMode;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import com.gabri.fitcoreapi.muscle.domain.MuscleRole;
import com.gabri.fitcoreapi.exercise.repository.ExerciseMuscleActivationRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionExerciseRepository;
import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.List;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Comparator;

@Service
@Transactional
public class WorkoutSessionService {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;
    private final MessageResolver messageResolver;
    private final WorkoutSessionExerciseRepository sessionExerciseRepository;
    private final ExerciseMuscleActivationRepository activationRepository;

    public WorkoutSessionService(
            WorkoutSessionRepository workoutSessionRepository,
            UserRepository userRepository,
            EntityManager entityManager,
            MessageResolver messageResolver,
            WorkoutSessionExerciseRepository sessionExerciseRepository,
            ExerciseMuscleActivationRepository activationRepository
    ) {
        this.workoutSessionRepository = workoutSessionRepository;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
        this.messageResolver = messageResolver;
        this.sessionExerciseRepository = sessionExerciseRepository;
        this.activationRepository = activationRepository;
    }

    public WorkoutSession createWorkoutSession(
            Long userId,
            Long workoutDayId,
            LocalDate sessionDate,
            WorkoutSessionCategory sessionCategory,
            WorkoutSessionIntensity sessionIntensity,
            Integer durationMinutes,
            String notes,
            BigDecimal estimatedTotalCaloriesBurned,
            WorkoutMuscleSelectionMode muscleSelectionMode,
            List<MuscleGroup> manualMuscleGroups
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.user.notFound", userId)
                ));

        WorkoutSession workoutSession = new WorkoutSession(
                sessionDate,
                sessionCategory,
                sessionIntensity,
                durationMinutes,
                notes,
                estimatedTotalCaloriesBurned
        );

        workoutSession.setUser(user);
        workoutSession.configureMuscleSelection(muscleSelectionMode, manualMuscleGroups);

        if (workoutDayId != null) {
            WorkoutDay workoutDay = entityManager.find(WorkoutDay.class, workoutDayId);

            if (workoutDay == null) {
                throw new ResourceNotFoundException(
                        messageResolver.get("error.workoutDay.notFound", workoutDayId)
                );
            }

            if (!workoutDay.getWorkoutPlan().getUser().getId().equals(user.getId())) {
                throw new ResourceNotFoundException(messageResolver.get("error.workoutDay.notFound", workoutDayId));
            }

            workoutSession.setWorkoutDay(workoutDay);

            // Snapshot the prescription into execution. Subsequent edits to the plan
            // must never alter a session or its pending set logs.
            workoutDay.getWorkoutExercises().stream()
                    .sorted(Comparator.comparing(WorkoutExercise::getExerciseOrder))
                    .forEach(planned -> {
                        WorkoutSessionExercise performed = new WorkoutSessionExercise(
                                planned, planned.getExerciseVariant(), planned.getRestSeconds(),
                                false, 0, 0, null, null, null, null);
                        workoutSession.addSessionExercise(performed);
                        for (int setNumber = 1; setNumber <= planned.getSets(); setNumber++) {
                            performed.addSetLog(new ExerciseSetLog(
                                    performed, setNumber, null, planned.getReps(), null, null, false, null));
                        }
                    });
        }

        return workoutSessionRepository.save(workoutSession);
    }

    @Transactional(readOnly = true)
    public List<WorkoutSession> getWorkoutSessionsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.user.notFound", userId)
                ));

        return workoutSessionRepository.findByUserOrderBySessionDateDesc(user);
    }

    @Transactional(readOnly = true)
    public List<WorkoutSession> getWorkoutSessionsByUserAndDateRange(
            Long userId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.user.notFound", userId)
                ));

        return workoutSessionRepository.findByUserAndSessionDateBetweenOrderBySessionDateDesc(
                user, startDate, endDate
        );
    }

    @Transactional(readOnly = true)
    public WorkoutSession getWorkoutSessionById(Long userId, Long workoutSessionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.user.notFound", userId)
                ));

        return workoutSessionRepository.findByIdAndUser(workoutSessionId, user)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.workoutSession.notFound", workoutSessionId)
                ));
    }

    public WorkoutSession updateWorkoutSession(Long userId, Long workoutSessionId,
            LocalDate sessionDate, WorkoutSessionCategory category, WorkoutSessionIntensity intensity,
            Integer durationMinutes, String notes, BigDecimal estimatedCalories,
            WorkoutMuscleSelectionMode mode, List<MuscleGroup> manualMuscleGroups) {
        WorkoutSession session = getWorkoutSessionById(userId, workoutSessionId);
        try {
            session.update(sessionDate, category, intensity, durationMinutes, notes, estimatedCalories);
            if (mode != null || manualMuscleGroups != null) {
                WorkoutMuscleSelectionMode selected = mode == null ? session.getMuscleSelectionMode() : mode;
                Collection<MuscleGroup> selectedGroups = manualMuscleGroups == null
                        ? selected == WorkoutMuscleSelectionMode.MANUAL ? session.getManualMuscleGroups() : List.of()
                        : manualMuscleGroups;
                session.configureMuscleSelection(selected, selectedGroups);
            }
        } catch (IllegalStateException exception) {
            throw new BusinessRuleException(exception.getMessage());
        }
        return session;
    }

    public WorkoutSession completeWorkoutSession(Long userId, Long workoutSessionId) {
        WorkoutSession session = getWorkoutSessionById(userId, workoutSessionId);
        try {
            session.complete(Instant.now());
        } catch (IllegalStateException exception) {
            throw new BusinessRuleException(exception.getMessage());
        }
        return session;
    }

    public WorkoutSession cancelWorkoutSession(Long userId, Long workoutSessionId) {
        WorkoutSession session = getWorkoutSessionById(userId, workoutSessionId);
        try {
            session.cancel();
        } catch (IllegalStateException exception) {
            throw new BusinessRuleException(exception.getMessage());
        }
        return session;
    }

    @Transactional(readOnly = true)
    public List<MuscleGroup> getSessionMuscleGroups(Long userId, Long workoutSessionId) {
        WorkoutSession session = getWorkoutSessionById(userId, workoutSessionId);
        if (session.getMuscleSelectionMode() == WorkoutMuscleSelectionMode.MANUAL) {
            return session.getManualMuscleGroups().stream().sorted().toList();
        }
        List<Long> variantIds = sessionExerciseRepository.findByWorkoutSessionOrderByIdAsc(session)
                .stream().map(exercise -> exercise.getExerciseVariant().getId())
                .distinct().toList();
        if (variantIds.isEmpty()) return List.of();

        return activationRepository.findByExerciseVariantIdIn(variantIds).stream()
                .filter(activation -> activation.getRole() != MuscleRole.STABILIZER)
                .map(activation -> activation.getMuscle().getMuscleGroup())
                .distinct().sorted().toList();
    }

    public void deleteWorkoutSession(Long userId, Long workoutSessionId) {
        WorkoutSession session = getWorkoutSessionById(userId, workoutSessionId);
        if (session.getStatus() == WorkoutSessionStatus.COMPLETED) {
            throw new BusinessRuleException("Completed workout sessions cannot be deleted; cancel or retain the history");
        }
        workoutSessionRepository.delete(session);
    }
}
