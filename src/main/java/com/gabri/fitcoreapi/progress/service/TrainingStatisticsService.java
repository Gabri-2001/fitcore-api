package com.gabri.fitcoreapi.progress.service;

import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.exercise.domain.ExerciseMuscleActivation;
import com.gabri.fitcoreapi.exercise.repository.ExerciseMuscleActivationRepository;
import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.goal.domain.GoalType;
import com.gabri.fitcoreapi.goal.repository.GoalProfileRepository;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import com.gabri.fitcoreapi.muscle.domain.MuscleRole;
import com.gabri.fitcoreapi.progress.domain.AssessmentConfidence;
import com.gabri.fitcoreapi.progress.domain.GoalProgressStatus;
import com.gabri.fitcoreapi.progress.domain.GoalSignalStatus;
import com.gabri.fitcoreapi.progress.domain.ProgressRecord;
import com.gabri.fitcoreapi.progress.dto.*;
import com.gabri.fitcoreapi.progress.repository.ProgressRecordRepository;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.ExerciseSetLog;
import com.gabri.fitcoreapi.workout.domain.WorkoutPlan;
import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.repository.ExerciseSetLogRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutPlanRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class TrainingStatisticsService {

    private static final BigDecimal PRIMARY_WEIGHT = BigDecimal.ONE;
    private static final BigDecimal SECONDARY_WEIGHT = new BigDecimal("0.50");

    private final UserRepository users;
    private final WorkoutSessionRepository sessions;
    private final ExerciseSetLogRepository setLogs;
    private final ExerciseMuscleActivationRepository activations;
    private final GoalProfileRepository goals;
    private final WorkoutPlanRepository plans;
    private final ProgressRecordRepository progressRecords;

    public TrainingStatisticsService(
            UserRepository users,
            WorkoutSessionRepository sessions,
            ExerciseSetLogRepository setLogs,
            ExerciseMuscleActivationRepository activations,
            GoalProfileRepository goals,
            WorkoutPlanRepository plans,
            ProgressRecordRepository progressRecords
    ) {
        this.users = users;
        this.sessions = sessions;
        this.setLogs = setLogs;
        this.activations = activations;
        this.goals = goals;
        this.plans = plans;
        this.progressRecords = progressRecords;
    }

    public TrainingStatisticsResponse getStatistics(Long userId, LocalDate from, LocalDate to) {
        validatePeriod(from, to);
        User user = users.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        long periodDays = ChronoUnit.DAYS.between(from, to) + 1;
        LocalDate previousTo = from.minusDays(1);
        LocalDate previousFrom = previousTo.minusDays(periodDays - 1);

        Snapshot current = snapshot(userId, from, to);
        Snapshot previous = snapshot(userId, previousFrom, previousTo);
        TrainingComparisonResponse comparison = comparison(previousFrom, previousTo, current.stats(), previous.stats());
        List<MuscleDistributionResponse> distribution = muscleDistribution(current.logs());
        List<ProgressRecord> records = progressRecords
                .findByUserIdAndRecordDateBetweenOrderByRecordDateAsc(userId, from, to);
        GoalProgressAssessmentResponse goalProgress = assessGoal(
                user,
                current.stats(),
                comparison,
                records,
                periodDays
        );

        return new TrainingStatisticsResponse(from, to, current.stats(), comparison, distribution, goalProgress);
    }

    private void validatePeriod(LocalDate from, LocalDate to) {
        if (from == null || to == null) throw new BusinessRuleException("Statistics period is required");
        if (from.isAfter(to)) throw new BusinessRuleException("Statistics start date must not be after end date");
        if (ChronoUnit.DAYS.between(from, to) >= 366) {
            throw new BusinessRuleException("Statistics period cannot exceed 366 days");
        }
    }

    private Snapshot snapshot(Long userId, LocalDate from, LocalDate to) {
        List<WorkoutSession> periodSessions = sessions
                .findByUserIdAndSessionDateBetweenOrderBySessionDateAsc(userId, from, to);
        List<ExerciseSetLog> logs = setLogs.findCompletedForStatistics(userId, from, to);
        long duration = periodSessions.stream().map(WorkoutSession::getDurationMinutes)
                .filter(Objects::nonNull).mapToLong(Integer::longValue).sum();
        BigDecimal totalVolume = rounded(logs.stream().map(this::volume).reduce(BigDecimal.ZERO, BigDecimal::add));
        BigDecimal bestOneRepMax = rounded(logs.stream().map(ExerciseSetLog::estimatedOneRepMax)
                .max(BigDecimal::compareTo).orElse(BigDecimal.ZERO));
        return new Snapshot(
                new TrainingPeriodStatsResponse(periodSessions.size(), duration, logs.size(), totalVolume, bestOneRepMax),
                logs
        );
    }

    private TrainingComparisonResponse comparison(LocalDate from, LocalDate to,
            TrainingPeriodStatsResponse current, TrainingPeriodStatsResponse previous) {
        return new TrainingComparisonResponse(
                from,
                to,
                previous,
                percentChange(BigDecimal.valueOf(current.workouts()), BigDecimal.valueOf(previous.workouts())),
                percentChange(BigDecimal.valueOf(current.durationMinutes()), BigDecimal.valueOf(previous.durationMinutes())),
                percentChange(BigDecimal.valueOf(current.completedSets()), BigDecimal.valueOf(previous.completedSets())),
                percentChange(current.totalVolume(), previous.totalVolume()),
                percentChange(current.bestEstimatedOneRepMax(), previous.bestEstimatedOneRepMax())
        );
    }

    private List<MuscleDistributionResponse> muscleDistribution(List<ExerciseSetLog> logs) {
        if (logs.isEmpty()) return List.of();
        List<Long> variantIds = logs.stream()
                .map(log -> log.getWorkoutSessionExercise().getExerciseVariant().getId())
                .distinct().toList();
        Map<Long, Map<MuscleGroup, BigDecimal>> weightsByVariant = new HashMap<>();
        for (ExerciseMuscleActivation activation : activations.findByExerciseVariantIdIn(variantIds)) {
            BigDecimal roleWeight = roleWeight(activation.getRole());
            if (roleWeight.signum() == 0) continue;
            weightsByVariant.computeIfAbsent(activation.getExerciseVariant().getId(), ignored -> new EnumMap<>(MuscleGroup.class))
                    .merge(activation.getMuscle().getMuscleGroup(), roleWeight, BigDecimal::max);
        }

        Map<MuscleGroup, BigDecimal> effectiveSets = new EnumMap<>(MuscleGroup.class);
        Map<MuscleGroup, BigDecimal> allocatedVolume = new EnumMap<>(MuscleGroup.class);
        for (ExerciseSetLog log : logs) {
            var variant = log.getWorkoutSessionExercise().getExerciseVariant();
            Map<MuscleGroup, BigDecimal> weights = weightsByVariant.get(variant.getId());
            if (weights == null || weights.isEmpty()) {
                weights = Map.of(variant.getExercise().getMainMuscleGroup(), BigDecimal.ONE);
            }
            BigDecimal setVolume = volume(log);
            for (var entry : weights.entrySet()) {
                effectiveSets.merge(entry.getKey(), entry.getValue(), BigDecimal::add);
                allocatedVolume.merge(entry.getKey(), setVolume.multiply(entry.getValue()), BigDecimal::add);
            }
        }

        BigDecimal totalEffectiveSets = effectiveSets.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        return effectiveSets.entrySet().stream()
                .map(entry -> new MuscleDistributionResponse(
                        entry.getKey(),
                        rounded(entry.getValue()),
                        rounded(allocatedVolume.getOrDefault(entry.getKey(), BigDecimal.ZERO)),
                        totalEffectiveSets.signum() == 0 ? BigDecimal.ZERO
                                : entry.getValue().multiply(BigDecimal.valueOf(100))
                                        .divide(totalEffectiveSets, 2, RoundingMode.HALF_UP)
                ))
                .sorted(Comparator.comparing(MuscleDistributionResponse::effectiveSets).reversed())
                .toList();
    }

    private GoalProgressAssessmentResponse assessGoal(
            User user,
            TrainingPeriodStatsResponse current,
            TrainingComparisonResponse comparison,
            List<ProgressRecord> records,
            long periodDays
    ) {
        GoalProfile goal = goals.findByUserAndActiveTrue(user).orElse(null);
        if (goal == null) {
            return insufficient(null, "goal.progress.no-active-goal", List.of("ACTIVE_GOAL_REQUIRED"));
        }

        WorkoutPlan plan = plans.findByUserAndActiveTrue(user).orElse(null);
        BigDecimal adherence = trainingAdherence(current.workouts(), plan, periodDays);
        boolean trainingAligned = adherence != null && adherence.compareTo(new BigDecimal("75")) >= 0;
        List<GoalSignalResponse> signals = new ArrayList<>();
        List<String> limitations = new ArrayList<>();
        signals.add(new GoalSignalResponse(
                "TRAINING_ADHERENCE",
                signalForAdherence(adherence),
                adherence
        ));
        if (adherence == null) limitations.add("ACTIVE_WORKOUT_PLAN_WITH_DAYS_REQUIRED");

        if (goal.getGoalType() == GoalType.PERFORMANCE) {
            BigDecimal trend = firstNonNull(comparison.oneRepMaxChangePercent(), comparison.volumeChangePercent());
            signals.add(new GoalSignalResponse("PERFORMANCE_TREND", signalForPositiveTrend(trend), trend));
            if (trend == null) {
                limitations.add("PREVIOUS_TRAINING_PERIOD_REQUIRED");
                return assessment(goal.getGoalType(), GoalProgressStatus.INSUFFICIENT_DATA,
                        AssessmentConfidence.LOW, trainingAligned, adherence, null, signals, limitations);
            }
            GoalProgressStatus status = trend.compareTo(BigDecimal.ONE) > 0
                    ? GoalProgressStatus.APPROACHING
                    : (trend.compareTo(new BigDecimal("-2")) >= 0 && trainingAligned
                            ? GoalProgressStatus.ON_TRACK : GoalProgressStatus.NEEDS_ATTENTION);
            return assessment(goal.getGoalType(), status, AssessmentConfidence.MEDIUM,
                    trainingAligned, adherence, trend, signals, limitations);
        }

        if (records.size() < 2) {
            limitations.add("TWO_BODY_MEASUREMENTS_REQUIRED");
            return assessment(goal.getGoalType(), GoalProgressStatus.INSUFFICIENT_DATA,
                    AssessmentConfidence.LOW, trainingAligned, adherence, null, signals, limitations);
        }

        ProgressRecord first = records.getFirst();
        ProgressRecord last = records.getLast();
        Outcome outcome = bodyOutcome(goal.getGoalType(), first, last);
        signals.addAll(outcome.signals());
        limitations.addAll(outcome.limitations());
        if (outcome.desiredTrend() == null) {
            return assessment(goal.getGoalType(), GoalProgressStatus.INSUFFICIENT_DATA,
                    AssessmentConfidence.LOW, trainingAligned, adherence, null, signals, limitations);
        }

        GoalProgressStatus status;
        if (goal.getGoalType() == GoalType.MAINTENANCE) {
            status = outcome.desiredTrend().compareTo(BigDecimal.ZERO) >= 0 && trainingAligned
                    ? GoalProgressStatus.ON_TRACK : GoalProgressStatus.NEEDS_ATTENTION;
        } else if (outcome.desiredTrend().compareTo(new BigDecimal("0.5")) > 0) {
            status = trainingAligned ? GoalProgressStatus.APPROACHING : GoalProgressStatus.ON_TRACK;
        } else if (outcome.desiredTrend().compareTo(new BigDecimal("-0.5")) >= 0 && trainingAligned) {
            status = GoalProgressStatus.ON_TRACK;
        } else {
            status = GoalProgressStatus.NEEDS_ATTENTION;
        }
        return assessment(goal.getGoalType(), status, outcome.confidence(),
                trainingAligned, adherence, outcome.desiredTrend(), signals, limitations);
    }

    private Outcome bodyOutcome(GoalType goalType, ProgressRecord first, ProgressRecord last) {
        List<GoalSignalResponse> signals = new ArrayList<>();
        List<String> limitations = new ArrayList<>();
        return switch (goalType) {
            case FAT_LOSS -> decreasingOutcome(first, last, signals, limitations);
            case MUSCLE_GAIN -> increasingOutcome(first, last, signals, limitations);
            case RECOMPOSITION -> recompositionOutcome(first, last, signals, limitations);
            case MAINTENANCE -> maintenanceOutcome(first, last, signals, limitations);
            case PERFORMANCE -> throw new IllegalStateException("Performance is assessed from training data");
        };
    }

    private Outcome decreasingOutcome(ProgressRecord first, ProgressRecord last,
            List<GoalSignalResponse> signals, List<String> limitations) {
        BigDecimal raw = metricChange(first.getBodyFatPercentage(), last.getBodyFatPercentage());
        AssessmentConfidence confidence = AssessmentConfidence.HIGH;
        String code = "BODY_FAT_TREND";
        if (raw == null) {
            raw = metricChange(first.getWeightKg(), last.getWeightKg());
            confidence = AssessmentConfidence.MEDIUM;
            code = "WEIGHT_TREND";
            limitations.add("BODY_FAT_MEASUREMENTS_RECOMMENDED");
        }
        BigDecimal desired = raw == null ? null : raw.negate();
        signals.add(new GoalSignalResponse(code, signalForPositiveTrend(desired), raw));
        return new Outcome(desired, confidence, signals, limitations);
    }

    private Outcome increasingOutcome(ProgressRecord first, ProgressRecord last,
            List<GoalSignalResponse> signals, List<String> limitations) {
        BigDecimal raw = metricChange(first.getMuscleMassKg(), last.getMuscleMassKg());
        AssessmentConfidence confidence = AssessmentConfidence.HIGH;
        String code = "MUSCLE_MASS_TREND";
        if (raw == null) {
            raw = metricChange(first.getWeightKg(), last.getWeightKg());
            confidence = AssessmentConfidence.MEDIUM;
            code = "WEIGHT_TREND";
            limitations.add("MUSCLE_MASS_MEASUREMENTS_RECOMMENDED");
        }
        signals.add(new GoalSignalResponse(code, signalForPositiveTrend(raw), raw));
        return new Outcome(raw, confidence, signals, limitations);
    }

    private Outcome recompositionOutcome(ProgressRecord first, ProgressRecord last,
            List<GoalSignalResponse> signals, List<String> limitations) {
        BigDecimal fatChange = metricChange(first.getBodyFatPercentage(), last.getBodyFatPercentage());
        BigDecimal muscleChange = metricChange(first.getMuscleMassKg(), last.getMuscleMassKg());
        signals.add(new GoalSignalResponse("BODY_FAT_TREND",
                signalForPositiveTrend(fatChange == null ? null : fatChange.negate()), fatChange));
        signals.add(new GoalSignalResponse("MUSCLE_MASS_TREND", signalForPositiveTrend(muscleChange), muscleChange));
        if (fatChange == null || muscleChange == null) {
            limitations.add("BODY_FAT_AND_MUSCLE_MASS_MEASUREMENTS_REQUIRED");
            return new Outcome(null, AssessmentConfidence.LOW, signals, limitations);
        }
        BigDecimal desired = fatChange.negate().add(muscleChange)
                .divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
        return new Outcome(desired, AssessmentConfidence.HIGH, signals, limitations);
    }

    private Outcome maintenanceOutcome(ProgressRecord first, ProgressRecord last,
            List<GoalSignalResponse> signals, List<String> limitations) {
        BigDecimal weightChange = metricChange(first.getWeightKg(), last.getWeightKg());
        if (weightChange == null) {
            limitations.add("WEIGHT_MEASUREMENTS_REQUIRED");
            signals.add(new GoalSignalResponse("WEIGHT_STABILITY", GoalSignalStatus.UNKNOWN, null));
            return new Outcome(null, AssessmentConfidence.LOW, signals, limitations);
        }
        BigDecimal stabilityMargin = new BigDecimal("2").subtract(weightChange.abs());
        signals.add(new GoalSignalResponse("WEIGHT_STABILITY",
                stabilityMargin.signum() >= 0 ? GoalSignalStatus.POSITIVE : GoalSignalStatus.NEGATIVE,
                weightChange));
        return new Outcome(stabilityMargin, AssessmentConfidence.MEDIUM, signals, limitations);
    }

    private BigDecimal trainingAdherence(long workouts, WorkoutPlan plan, long periodDays) {
        if (plan == null || plan.getWorkoutDays().isEmpty()) return null;
        long trainingDays = plan.getWorkoutDays().stream()
                .filter(day -> day.getDayType() != com.gabri.fitcoreapi.workout.domain.WorkoutDayType.REST)
                .count();
        if (trainingDays == 0) return null;
        BigDecimal expected = BigDecimal.valueOf(trainingDays)
                .multiply(BigDecimal.valueOf(periodDays))
                .divide(BigDecimal.valueOf(7), 4, RoundingMode.HALF_UP);
        if (expected.signum() == 0) return null;
        return BigDecimal.valueOf(workouts).multiply(BigDecimal.valueOf(100))
                .divide(expected, 2, RoundingMode.HALF_UP)
                .min(new BigDecimal("200"));
    }

    private GoalProgressAssessmentResponse insufficient(GoalType goalType, String summaryKey,
            List<String> limitations) {
        return new GoalProgressAssessmentResponse(goalType, GoalProgressStatus.INSUFFICIENT_DATA,
                AssessmentConfidence.LOW, false, null, null, summaryKey, List.of(), limitations);
    }

    private GoalProgressAssessmentResponse assessment(GoalType goalType, GoalProgressStatus status,
            AssessmentConfidence confidence, boolean trainingAligned, BigDecimal adherence, BigDecimal trend,
            List<GoalSignalResponse> signals, List<String> limitations) {
        return new GoalProgressAssessmentResponse(
                goalType, status, confidence, trainingAligned, adherence, trend,
                "goal.progress." + status.name().toLowerCase(Locale.ROOT).replace('_', '-'),
                List.copyOf(signals), List.copyOf(limitations)
        );
    }

    private GoalSignalStatus signalForAdherence(BigDecimal adherence) {
        if (adherence == null) return GoalSignalStatus.UNKNOWN;
        if (adherence.compareTo(new BigDecimal("75")) >= 0) return GoalSignalStatus.POSITIVE;
        if (adherence.compareTo(new BigDecimal("50")) >= 0) return GoalSignalStatus.NEUTRAL;
        return GoalSignalStatus.NEGATIVE;
    }

    private GoalSignalStatus signalForPositiveTrend(BigDecimal trend) {
        if (trend == null) return GoalSignalStatus.UNKNOWN;
        if (trend.compareTo(new BigDecimal("0.5")) > 0) return GoalSignalStatus.POSITIVE;
        if (trend.compareTo(new BigDecimal("-0.5")) >= 0) return GoalSignalStatus.NEUTRAL;
        return GoalSignalStatus.NEGATIVE;
    }

    private BigDecimal metricChange(BigDecimal first, BigDecimal last) {
        return first == null || last == null ? null : percentChange(last, first);
    }

    private BigDecimal percentChange(BigDecimal current, BigDecimal previous) {
        if (current == null || previous == null || previous.signum() == 0) return null;
        return current.subtract(previous).multiply(BigDecimal.valueOf(100))
                .divide(previous.abs(), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal firstNonNull(BigDecimal first, BigDecimal second) {
        return first != null ? first : second;
    }

    private BigDecimal roleWeight(MuscleRole role) {
        return switch (role) {
            case PRIMARY -> PRIMARY_WEIGHT;
            case SECONDARY -> SECONDARY_WEIGHT;
            case STABILIZER -> BigDecimal.ZERO;
        };
    }

    private BigDecimal volume(ExerciseSetLog log) {
        return log.getWeight() == null || log.getReps() == null
                ? BigDecimal.ZERO
                : log.getWeight().multiply(BigDecimal.valueOf(log.getReps()));
    }

    private BigDecimal rounded(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private record Snapshot(TrainingPeriodStatsResponse stats, List<ExerciseSetLog> logs) {
    }

    private record Outcome(
            BigDecimal desiredTrend,
            AssessmentConfidence confidence,
            List<GoalSignalResponse> signals,
            List<String> limitations
    ) {
    }
}
