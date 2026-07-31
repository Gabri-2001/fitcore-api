package com.gabri.fitcoreapi.progress.service;

import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import com.gabri.fitcoreapi.progress.dto.*;
import com.gabri.fitcoreapi.workout.domain.ExerciseSetLog;
import com.gabri.fitcoreapi.workout.repository.ExerciseSetLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ExerciseProgressService {
    private final ExerciseSetLogRepository logs;
    public ExerciseProgressService(ExerciseSetLogRepository logs) { this.logs = logs; }

    public ExerciseProgressResponse byVariant(Long userId, String code) {
        return summarize(code, completed(userId), log -> variantCode(log).equals(code));
    }

    public ExerciseProgressResponse byExercise(Long userId, String code) {
        return summarize(code, completed(userId), log -> exerciseCode(log).equals(code));
    }

    public ProgressOverviewResponse overview(Long userId) {
        List<ExerciseSetLog> values = completed(userId);
        Map<String, BigDecimal> weekly = new TreeMap<>();
        for (ExerciseSetLog log : values) {
            var date = log.getWorkoutSessionExercise().getWorkoutSession().getSessionDate();
            var fields = WeekFields.ISO;
            String key = date.getYear() + "-W" + String.format("%02d", date.get(fields.weekOfWeekBasedYear()));
            weekly.merge(key, volume(log), BigDecimal::add);
        }
        return new ProgressOverviewResponse(values.size(), totalVolume(values), bestOneRepMax(values), weekly);
    }

    public List<MuscleGroupProgressResponse> muscleGroups(Long userId) {
        return completed(userId).stream().collect(Collectors.groupingBy(log ->
                log.getWorkoutSessionExercise().getExerciseVariant().getExercise().getMainMuscleGroup()))
                .entrySet().stream().map(entry -> new MuscleGroupProgressResponse(entry.getKey(),
                        entry.getValue().size(), totalVolume(entry.getValue())))
                .sorted(Comparator.comparing(value -> value.muscleGroup().name())).toList();
    }

    private ExerciseProgressResponse summarize(String code, List<ExerciseSetLog> all, Predicate<ExerciseSetLog> filter) {
        List<ExerciseSetLog> values = all.stream().filter(filter).toList();
        if (values.isEmpty()) throw new ResourceNotFoundException("No exercise progress found for code: " + code);
        BigDecimal maxWeight = values.stream().map(ExerciseSetLog::getWeight).filter(Objects::nonNull)
                .max(BigDecimal::compareTo).orElse(BigDecimal.ZERO);
        int maxReps = values.stream().map(ExerciseSetLog::getReps).filter(Objects::nonNull).max(Integer::compareTo).orElse(0);
        var history = values.stream().map(log -> new ExerciseProgressResponse.ProgressPoint(
                log.getWorkoutSessionExercise().getWorkoutSession().getSessionDate(), variantCode(log), log.getWeight(),
                log.getReps(), volume(log), rounded(log.estimatedOneRepMax())))
                .sorted(Comparator.comparing(ExerciseProgressResponse.ProgressPoint::date)).toList();
        return new ExerciseProgressResponse(code, maxWeight, maxReps, totalVolume(values), bestOneRepMax(values), values.size(), history);
    }

    private List<ExerciseSetLog> completed(Long userId) { return logs.findByWorkoutSessionExerciseWorkoutSessionUserIdAndCompletedTrue(userId); }
    private String variantCode(ExerciseSetLog log) { return log.getWorkoutSessionExercise().getExerciseVariant().getCode(); }
    private String exerciseCode(ExerciseSetLog log) { return log.getWorkoutSessionExercise().getExerciseVariant().getExercise().getCode(); }
    private BigDecimal volume(ExerciseSetLog log) {
        return log.getWeight() == null || log.getReps() == null ? BigDecimal.ZERO : log.getWeight().multiply(BigDecimal.valueOf(log.getReps()));
    }
    private BigDecimal totalVolume(List<ExerciseSetLog> values) { return rounded(values.stream().map(this::volume).reduce(BigDecimal.ZERO, BigDecimal::add)); }
    private BigDecimal bestOneRepMax(List<ExerciseSetLog> values) { return rounded(values.stream().map(ExerciseSetLog::estimatedOneRepMax).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO)); }
    private BigDecimal rounded(BigDecimal value) { return value.setScale(2, RoundingMode.HALF_UP); }
}
