package com.gabri.fitcoreapi.workout.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.common.i18n.MessageResolver;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.WorkoutDay;
import com.gabri.fitcoreapi.workout.domain.WorkoutExercise;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import com.gabri.fitcoreapi.workout.domain.ExerciseSetLog;
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
import java.util.Comparator;

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

    public WorkoutSession createWorkoutSession(Long userId, Long workoutDayId,
            LocalDate sessionDate, WorkoutSessionCategory category,
            WorkoutSessionIntensity intensity, Integer durationMinutes, String notes,
            BigDecimal calories, com.gabri.fitcoreapi.workout.domain.WorkoutDayType dayType,
            boolean dayTypeManual) {
        WorkoutSession session = createWorkoutSession(userId, workoutDayId, sessionDate,
                category, intensity, durationMinutes, notes, calories);
        if(dayTypeManual && dayType == null) {
            throw new BusinessRuleException("Selecciona un tipo de entrenamiento manual");
        }
        if(dayType == com.gabri.fitcoreapi.workout.domain.WorkoutDayType.REST) {
            throw new BusinessRuleException("Descanso no puede ser una sesión de entrenamiento");
        }
        if(dayType == null && !dayTypeManual && session.getWorkoutDay() != null) {
            dayType = session.getWorkoutDay().getDayType();
            if(dayType == com.gabri.fitcoreapi.workout.domain.WorkoutDayType.REST) dayType = null;
        }
        session.setTrainingDayClassification(dayType, dayTypeManual);
        return workoutSessionRepository.save(session);
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
            populateFromWorkoutDay(workoutSession, workoutDay);
        }

        return workoutSessionRepository.save(workoutSession);
    }

    /**
     * Each workout session keeps its own snapshot of the chosen plan day.
     * Changing a plan later must never rewrite the sets or exercise list
     * belonging to an existing session.
     */
    private void populateFromWorkoutDay(WorkoutSession session, WorkoutDay workoutDay) {
        workoutDay.getWorkoutExercises().stream()
                .sorted(Comparator.comparing(WorkoutExercise::getExerciseOrder))
                .forEach(planned -> {
                    WorkoutSessionExercise sessionExercise = new WorkoutSessionExercise(
                            planned, planned.getExerciseVariant(), planned.getRestSeconds(),
                            false, 0, 0, null, null, null, null
                    );
                    for (int number = 1; number <= planned.getSets(); number++) {
                        ExerciseSetLog set = new ExerciseSetLog(
                                sessionExercise, number, null, planned.getReps(),
                                null, null, false, null
                        );
                        String loadMode = "BODYWEIGHT".equals(
                                planned.getExerciseVariant().getResistanceSource())
                                ? "BODYWEIGHT" : "EXTERNAL_LOAD";
                        set.updateMetrics(planned.getTargetDurationSeconds(),
                                planned.getTargetDistanceMeters(), null, null, loadMode);
                        sessionExercise.addSetLog(set);
                    }
                    session.addSessionExercise(sessionExercise);
                });
    }

    /**
     * Explicit recovery for sessions started before automatic plan import.
     * Never overwrites an exercise the user has already recorded.
     */
    public WorkoutSession importPlannedExercises(Long userId, Long sessionId) {
        WorkoutSession session = getWorkoutSessionById(userId, sessionId);
        if (!session.isEditable()) {
            throw new BusinessRuleException("Solo se pueden cargar ejercicios en sesiones en curso");
        }
        if (session.getWorkoutDay() == null) {
            throw new BusinessRuleException("Esta sesión no tiene un día del plan asociado");
        }
        if (!session.getSessionExercises().isEmpty()) {
            throw new BusinessRuleException(
                    "La sesión ya contiene ejercicios. No se importarán duplicados");
        }
        if (session.getWorkoutDay().getWorkoutExercises().isEmpty()) {
            throw new BusinessRuleException("El día del plan seleccionado no contiene ejercicios");
        }
        populateFromWorkoutDay(session, session.getWorkoutDay());
        return workoutSessionRepository.save(session);
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
            com.gabri.fitcoreapi.workout.domain.WorkoutDayType trainingType,
            Boolean manualType) {
        WorkoutSession session = updateWorkoutSession(userId, workoutSessionId,
                sessionDate, category, intensity, durationMinutes, notes, estimatedCalories);
        if(trainingType != null || manualType != null) {
            boolean manual = manualType != null ? manualType : session.isTrainingDayTypeManual();
            var type = trainingType != null ? trainingType : session.getTrainingDayType();
            if(type == com.gabri.fitcoreapi.workout.domain.WorkoutDayType.REST) {
                throw new BusinessRuleException("Descanso no puede ser una sesión de entrenamiento");
            }
            if(manual && type == null) {
                throw new BusinessRuleException("Selecciona un tipo de entrenamiento manual");
            }
            session.setTrainingDayClassification(type, manual);
        }
        return session;
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
