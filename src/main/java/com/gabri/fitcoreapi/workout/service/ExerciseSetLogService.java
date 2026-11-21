package com.gabri.fitcoreapi.workout.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.workout.domain.*;
import com.gabri.fitcoreapi.workout.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ExerciseSetLogService {
    private final WorkoutSessionExerciseRepository sessionExercises;
    private final ExerciseSetLogRepository setLogs;

    public ExerciseSetLogService(WorkoutSessionExerciseRepository sessionExercises, ExerciseSetLogRepository setLogs) {
        this.sessionExercises = sessionExercises;
        this.setLogs = setLogs;
    }

    public ExerciseSetLog create(Long userId, Long sessionExerciseId, Integer setNumber, BigDecimal weight,
            Integer reps, Integer rir, BigDecimal rpe, boolean completed, String notes) {
        WorkoutSessionExercise exercise = ownedExercise(userId, sessionExerciseId);
        requireEditable(exercise);
        try {
            ExerciseSetLog log = new ExerciseSetLog(exercise, setNumber, weight, reps, rir, rpe, completed, notes);
            exercise.addSetLog(log);
            ExerciseSetLog saved = setLogs.saveAndFlush(log);
            exercise.synchronizeSetSummary();
            return saved;
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessRuleException("Set number already exists for this session exercise");
        }
    }

    // New API preserves the pre-existing method for internal callers/tests.
    public ExerciseSetLog createWithMetrics(Long userId, Long sessionExerciseId,
            Integer setNumber, BigDecimal weight, Integer reps, Integer rir, BigDecimal rpe,
            boolean completed, String notes, Integer durationSeconds, BigDecimal distanceMeters,
            BigDecimal addedWeightKg, BigDecimal assistanceWeightKg, String loadMode) {
        WorkoutSessionExercise exercise = ownedExercise(userId, sessionExerciseId);
        requireEditable(exercise);
        validateMetrics(exercise, reps, durationSeconds, addedWeightKg, assistanceWeightKg, loadMode);
        try {
            ExerciseSetLog log = new ExerciseSetLog(exercise, setNumber, weight, reps, rir, rpe, completed, notes);
            log.updateMetrics(durationSeconds, distanceMeters, addedWeightKg, assistanceWeightKg, loadMode);
            exercise.addSetLog(log);
            ExerciseSetLog saved = setLogs.saveAndFlush(log);
            exercise.synchronizeSetSummary();
            return saved;
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessRuleException("Set number already exists for this session exercise");
        }
    }

    @Transactional(readOnly = true)
    public List<ExerciseSetLog> findAll(Long userId, Long sessionExerciseId) {
        return setLogs.findByWorkoutSessionExerciseOrderBySetNumber(ownedExercise(userId, sessionExerciseId));
    }

    public ExerciseSetLog update(Long userId, Long sessionExerciseId, Long setLogId,
            Integer setNumber, BigDecimal weight, Integer reps, Integer rir, BigDecimal rpe,
            boolean completed, String notes) {
        WorkoutSessionExercise exercise = ownedExercise(userId, sessionExerciseId);
        requireEditable(exercise);
        ExerciseSetLog log = ownedSetLog(userId, sessionExerciseId, setLogId);
        try {
            log.update(setNumber, weight, reps, rir, rpe, completed, notes);
            ExerciseSetLog saved = setLogs.saveAndFlush(log);
            exercise.synchronizeSetSummary();
            return saved;
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessRuleException("Set number already exists for this session exercise");
        }
    }

    public ExerciseSetLog updateWithMetrics(Long userId, Long sessionExerciseId, Long setLogId,
            Integer setNumber, BigDecimal weight, Integer reps, Integer rir, BigDecimal rpe,
            boolean completed, String notes, Integer durationSeconds, BigDecimal distanceMeters,
            BigDecimal addedWeightKg, BigDecimal assistanceWeightKg, String loadMode) {
        WorkoutSessionExercise exercise = ownedExercise(userId, sessionExerciseId);
        requireEditable(exercise);
        validateMetrics(exercise, reps, durationSeconds, addedWeightKg, assistanceWeightKg, loadMode);
        ExerciseSetLog log = ownedSetLog(userId, sessionExerciseId, setLogId);
        try {
            log.update(setNumber, weight, reps, rir, rpe, completed, notes);
            log.updateMetrics(durationSeconds, distanceMeters, addedWeightKg, assistanceWeightKg, loadMode);
            ExerciseSetLog saved = setLogs.saveAndFlush(log);
            exercise.synchronizeSetSummary();
            return saved;
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessRuleException("Set number already exists for this session exercise");
        }
    }

    private void validateMetrics(WorkoutSessionExercise exercise, Integer reps, Integer durationSeconds,
            BigDecimal addedWeightKg, BigDecimal assistanceWeightKg, String loadMode) {
        String mode = loadMode == null ? "EXTERNAL_LOAD" : loadMode;
        if (!java.util.Set.of("EXTERNAL_LOAD","BODYWEIGHT","WEIGHTED","ASSISTED").contains(mode))
            throw new BusinessRuleException("Unsupported set load mode");
        if ("WEIGHTED".equals(mode) != (addedWeightKg != null)
                || "ASSISTED".equals(mode) != (assistanceWeightKg != null))
            throw new BusinessRuleException("Lastre o asistencia incoherentes con el modo");
        var variant = exercise.getExerciseVariant();
        if ("WEIGHTED".equals(mode) && !variant.isAllowsAddedWeight())
            throw new BusinessRuleException("El ejercicio no admite lastre");
        if ("ASSISTED".equals(mode) && !variant.isAllowsAssistance())
            throw new BusinessRuleException("El ejercicio no admite asistencia");
        if (("BODYWEIGHT".equals(mode) || "WEIGHTED".equals(mode) || "ASSISTED".equals(mode))
                && !"BODYWEIGHT".equals(variant.getResistanceSource()))
            throw new BusinessRuleException("El ejercicio no es de peso corporal");
        if (durationSeconds != null && reps != null && reps > 0
                && "SECONDS".equals(variant.getExercise().getDefaultUnit()))
            throw new BusinessRuleException("El ejercicio se registra por tiempo, no repeticiones");
    }

    public void delete(Long userId, Long sessionExerciseId, Long setLogId) {
        WorkoutSessionExercise exercise = ownedExercise(userId, sessionExerciseId);
        requireEditable(exercise);
        ExerciseSetLog log = ownedSetLog(userId, sessionExerciseId, setLogId);
        exercise.removeSetLog(log);
        setLogs.delete(log);
        exercise.synchronizeSetSummary();
    }

    private WorkoutSessionExercise ownedExercise(Long userId, Long id) {
        return sessionExercises.findByIdAndWorkoutSessionUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout session exercise not found with id: " + id));
    }

    private ExerciseSetLog ownedSetLog(Long userId, Long sessionExerciseId, Long setLogId) {
        return setLogs.findByIdAndWorkoutSessionExerciseIdAndWorkoutSessionExerciseWorkoutSessionUserId(
                        setLogId, sessionExerciseId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Exercise set log not found with id: " + setLogId));
    }

    private void requireEditable(WorkoutSessionExercise exercise) {
        if (!exercise.getWorkoutSession().isEditable()) {
            throw new BusinessRuleException("Only an in-progress workout session can be modified");
        }
    }
}
