package com.gabri.fitcoreapi.workout.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.common.i18n.MessageResolver;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.WorkoutExercise;
import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionStatus;
import com.gabri.fitcoreapi.workout.dto.PreviousExercisePerformanceResponse;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionExerciseRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutExerciseRepository;
import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import com.gabri.fitcoreapi.exercise.repository.ExerciseVariantRepository;
import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
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
    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final ExerciseVariantRepository exerciseVariantRepository;
    private final MessageResolver messageResolver;

    public WorkoutSessionExerciseService(
            WorkoutSessionExerciseRepository workoutSessionExerciseRepository,
            WorkoutSessionRepository workoutSessionRepository,
            UserRepository userRepository,
            WorkoutExerciseRepository workoutExerciseRepository,
            ExerciseVariantRepository exerciseVariantRepository,
            MessageResolver messageResolver
    ) {
        this.workoutSessionExerciseRepository = workoutSessionExerciseRepository;
        this.workoutSessionRepository = workoutSessionRepository;
        this.userRepository = userRepository;
        this.workoutExerciseRepository = workoutExerciseRepository;
        this.exerciseVariantRepository = exerciseVariantRepository;
        this.messageResolver = messageResolver;
    }

    public WorkoutSessionExercise addWorkoutSessionExercise(
            Long userId,
            Long workoutSessionId,
            Long workoutExerciseId,
            String exerciseVariantCode,
            Integer requestedRestSeconds,
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
        requireEditable(workoutSession);

        ExerciseVariant variant = exerciseVariantRepository.findByCodeAndActiveTrue(exerciseVariantCode)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise variant not found with code: " + exerciseVariantCode));

        WorkoutExercise workoutExercise = null;
        if (workoutExerciseId != null) {
            workoutExercise = workoutExerciseRepository.findById(workoutExerciseId)
                    .orElseThrow(() -> new ResourceNotFoundException(messageResolver.get("error.workoutExercise.notFound", workoutExerciseId)));
            if (workoutSession.getWorkoutDay() == null ||
                    !workoutExercise.getWorkoutDay().getId().equals(workoutSession.getWorkoutDay().getId())) {
                throw new BusinessRuleException("The planned exercise does not belong to this workout session day");
            }
            if (!workoutExercise.getExerciseVariant().getId().equals(variant.getId())) {
                throw new BusinessRuleException("The exercise variant does not match the planned exercise");
            }
        }

        WorkoutSessionExercise sessionExercise = new WorkoutSessionExercise(
                workoutExercise,
                variant,
                requestedRestSeconds != null
                        ? requestedRestSeconds
                        : workoutExercise == null ? 0 : workoutExercise.getRestSeconds(),
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

    public WorkoutSessionExercise updateRestSeconds(
            Long userId,
            Long workoutSessionId,
            Long sessionExerciseId,
            Integer restSeconds
    ) {
        WorkoutSessionExercise exercise = ownedExercise(userId, workoutSessionId, sessionExerciseId);
        requireEditable(exercise.getWorkoutSession());
        exercise.updateRestSeconds(restSeconds);
        return exercise;
    }

    @Transactional(readOnly = true)
    public PreviousExercisePerformanceResponse getPreviousPerformance(
            Long userId,
            Long workoutSessionId,
            Long sessionExerciseId
    ) {
        WorkoutSessionExercise current = ownedExercise(userId, workoutSessionId, sessionExerciseId);
        return workoutSessionExerciseRepository
                .findFirstByWorkoutSessionUserIdAndExerciseVariantIdAndWorkoutSessionStatusAndWorkoutSessionIdNotAndWorkoutSessionSessionDateLessThanEqualOrderByWorkoutSessionSessionDateDescWorkoutSessionCompletedAtDesc(
                        userId,
                        current.getExerciseVariant().getId(),
                        WorkoutSessionStatus.COMPLETED,
                        workoutSessionId,
                        current.getWorkoutSession().getSessionDate()
                )
                .map(PreviousExercisePerformanceResponse::from)
                .orElseGet(PreviousExercisePerformanceResponse::empty);
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

        return workoutSessionExerciseRepository.findByWorkoutSessionOrderByIdAsc(workoutSession);
    }

    public WorkoutSessionExercise updateWorkoutSessionExercise(
            Long userId,
            Long workoutSessionId,
            Long sessionExerciseId,
            boolean completed,
            Integer performedSets,
            Integer performedReps,
            BigDecimal performedWeightKg,
            Integer performedDurationMinutes,
            BigDecimal estimatedCaloriesBurned,
            String notes
    ) {
        WorkoutSessionExercise exercise = ownedExercise(userId, workoutSessionId, sessionExerciseId);
        requireEditable(exercise.getWorkoutSession());
        if (!exercise.getSetLogs().isEmpty()) {
            throw new BusinessRuleException("Set-based exercise totals are derived from their set logs");
        }
        exercise.update(completed, performedSets, performedReps, performedWeightKg,
                performedDurationMinutes, estimatedCaloriesBurned, notes);
        return exercise;
    }

    public void deleteWorkoutSessionExercise(Long userId, Long workoutSessionId, Long sessionExerciseId) {
        WorkoutSessionExercise exercise = ownedExercise(userId, workoutSessionId, sessionExerciseId);
        requireEditable(exercise.getWorkoutSession());
        workoutSessionExerciseRepository.delete(exercise);
    }

    private WorkoutSessionExercise ownedExercise(Long userId, Long workoutSessionId, Long sessionExerciseId) {
        WorkoutSessionExercise exercise = workoutSessionExerciseRepository
                .findByIdAndWorkoutSessionUserId(sessionExerciseId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Workout session exercise not found with id: " + sessionExerciseId));
        if (!exercise.getWorkoutSession().getId().equals(workoutSessionId)) {
            throw new ResourceNotFoundException("Workout session exercise not found with id: " + sessionExerciseId);
        }
        return exercise;
    }

    private void requireEditable(WorkoutSession session) {
        if (!session.isEditable()) {
            throw new BusinessRuleException("Only an in-progress workout session can be modified");
        }
    }
}
