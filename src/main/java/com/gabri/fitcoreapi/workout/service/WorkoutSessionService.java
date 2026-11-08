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
import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

@Service
@Transactional
public class WorkoutSessionService {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;
    private final MessageResolver messageResolver;

    public WorkoutSessionService(
            WorkoutSessionRepository workoutSessionRepository,
            UserRepository userRepository,
            EntityManager entityManager,
            MessageResolver messageResolver
    ) {
        this.workoutSessionRepository = workoutSessionRepository;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
        this.messageResolver = messageResolver;
    }

    public WorkoutSession createWorkoutSession(
            Long userId,
            Long workoutDayId,
            LocalDate sessionDate,
            WorkoutSessionCategory sessionCategory,
            WorkoutSessionIntensity sessionIntensity,
            Integer durationMinutes,
            String notes,
            BigDecimal estimatedTotalCaloriesBurned
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
            Integer durationMinutes, String notes, BigDecimal estimatedCalories) {
        WorkoutSession session = getWorkoutSessionById(userId, workoutSessionId);
        try {
            session.update(sessionDate, category, intensity, durationMinutes, notes, estimatedCalories);
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

    public void deleteWorkoutSession(Long userId, Long workoutSessionId) {
        WorkoutSession session = getWorkoutSessionById(userId, workoutSessionId);
        if (session.getStatus() == WorkoutSessionStatus.COMPLETED) {
            throw new BusinessRuleException("Completed workout sessions cannot be deleted; cancel or retain the history");
        }
        workoutSessionRepository.delete(session);
    }
}
