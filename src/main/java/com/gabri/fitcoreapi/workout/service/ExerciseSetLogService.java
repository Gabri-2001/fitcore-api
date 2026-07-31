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
        try {
            return setLogs.save(new ExerciseSetLog(exercise, setNumber, weight, reps, rir, rpe, completed, notes));
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessRuleException("Set number already exists for this session exercise");
        }
    }

    @Transactional(readOnly = true)
    public List<ExerciseSetLog> findAll(Long userId, Long sessionExerciseId) {
        return setLogs.findByWorkoutSessionExerciseOrderBySetNumber(ownedExercise(userId, sessionExerciseId));
    }

    private WorkoutSessionExercise ownedExercise(Long userId, Long id) {
        return sessionExercises.findByIdAndWorkoutSessionUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Workout session exercise not found with id: " + id));
    }
}
