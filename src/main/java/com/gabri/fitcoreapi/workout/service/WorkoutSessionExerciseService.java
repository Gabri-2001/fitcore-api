package com.gabri.fitcoreapi.workout.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.common.i18n.MessageResolver;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.WorkoutExercise;
import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionExerciseRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionRepository;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class WorkoutSessionExerciseService {

    private final WorkoutSessionExerciseRepository workoutSessionExerciseRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;
    private final MessageResolver messageResolver;

    public WorkoutSessionExerciseService(
            WorkoutSessionExerciseRepository workoutSessionExerciseRepository,
            WorkoutSessionRepository workoutSessionRepository,
            UserRepository userRepository,
            EntityManager entityManager,
            MessageResolver messageResolver
    ) {
        this.workoutSessionExerciseRepository = workoutSessionExerciseRepository;
        this.workoutSessionRepository = workoutSessionRepository;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
        this.messageResolver = messageResolver;
    }

    public WorkoutSessionExercise addWorkoutSessionExercise(
            Long userId,
            Long workoutSessionId,
            Long workoutExerciseId,
            boolean completed,
            Integer performedSets,
            Integer performedReps,
            BigDecimal performedWeightKg,
            Integer performedDurationMinutes,
            BigDecimal estimatedCaloriesBurned,
            String notes
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.user.notFound", userId)
                ));

        WorkoutSession workoutSession = workoutSessionRepository.findById(workoutSessionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.workoutSession.notFound", workoutSessionId)
                ));

        if (!workoutSession.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException(
                    messageResolver.get("error.workoutSession.userMismatch", workoutSessionId, userId)
            );
        }

        WorkoutExercise workoutExercise = entityManager.find(WorkoutExercise.class, workoutExerciseId);
        if (workoutExercise == null) {
            throw new ResourceNotFoundException(
                    messageResolver.get("error.workoutExercise.notFound", workoutExerciseId)
            );
        }

        WorkoutSessionExercise sessionExercise = new WorkoutSessionExercise(
                workoutExercise,
                completed,
                performedSets,
                performedReps,
                performedWeightKg,
                performedDurationMinutes,
                estimatedCaloriesBurned,
                notes
        );

        sessionExercise.setWorkoutSession(workoutSession);

        return workoutSessionExerciseRepository.save(sessionExercise);
    }

    @Transactional(readOnly = true)
    public List<WorkoutSessionExercise> getWorkoutSessionExercises(Long userId, Long workoutSessionId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.user.notFound", userId)
                ));

        WorkoutSession workoutSession = workoutSessionRepository.findById(workoutSessionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        messageResolver.get("error.workoutSession.notFound", workoutSessionId)
                ));

        if (!workoutSession.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException(
                    messageResolver.get("error.workoutSession.userMismatch", workoutSessionId, userId)
            );
        }

        return workoutSessionExerciseRepository.findByWorkoutSession(workoutSession);
    }
}