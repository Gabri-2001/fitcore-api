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
