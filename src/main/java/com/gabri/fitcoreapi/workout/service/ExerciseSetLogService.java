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
        validateMetrics(exercise, weight, reps, rir, completed, durationSeconds, distanceMeters,
                addedWeightKg, assistanceWeightKg, loadMode);
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
        validateMetrics(exercise, weight, reps, rir, completed, durationSeconds, distanceMeters,
                addedWeightKg, assistanceWeightKg, loadMode);
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

    private void validateMetrics(WorkoutSessionExercise exercise,
            BigDecimal weight, Integer reps, Integer rir, boolean completed,
            Integer durationSeconds, BigDecimal distanceMeters, BigDecimal addedWeightKg,
            BigDecimal assistanceWeightKg, String loadMode) {
        String mode = loadMode == null ? "EXTERNAL_LOAD" : loadMode;
        if (!java.util.Set.of("EXTERNAL_LOAD", "BODYWEIGHT", "WEIGHTED", "ASSISTED").contains(mode))
            throw new BusinessRuleException("Modo de carga no compatible");
        var variant = exercise.getExerciseVariant();
        boolean bodyweight = "BODYWEIGHT".equals(variant.getResistanceSource());
        boolean timed = "SECONDS".equals(variant.getExercise().getDefaultUnit());

        if (weight != null && weight.signum() < 0
                || distanceMeters != null && distanceMeters.signum() < 0)
            throw new BusinessRuleException("El peso o la distancia no pueden ser negativos");

        if ("WEIGHTED".equals(mode)) {
            if (!bodyweight || !variant.isAllowsAddedWeight() || weight != null
                    || addedWeightKg == null || addedWeightKg.signum() <= 0
                    || assistanceWeightKg != null)
                throw new BusinessRuleException("El lastre debe ser positivo y estar permitido");
        } else if ("ASSISTED".equals(mode)) {
            if (!bodyweight || !variant.isAllowsAssistance() || weight != null
                    || assistanceWeightKg == null || assistanceWeightKg.signum() <= 0
                    || addedWeightKg != null)
                throw new BusinessRuleException("La asistencia debe ser positiva y estar permitida");
        } else if (addedWeightKg != null || assistanceWeightKg != null
                || "BODYWEIGHT".equals(mode) && (!bodyweight || weight != null)) {
            throw new BusinessRuleException("Carga incompatible con el modo seleccionado");
        }
        if (timed) {
            if (reps != null && reps > 0 || rir != null)
                throw new BusinessRuleException("Este ejercicio se registra por tiempo, sin repeticiones ni RIR");
            if (completed && (durationSeconds == null || durationSeconds <= 0))
                throw new BusinessRuleException("Una serie temporal completada requiere segundos positivos");
        } else {
            if (durationSeconds != null)
                throw new BusinessRuleException("Este ejercicio se registra por repeticiones, no por segundos");
            if (completed && (reps == null || reps <= 0))
                throw new BusinessRuleException("Una serie completada requiere repeticiones positivas");
        }
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
