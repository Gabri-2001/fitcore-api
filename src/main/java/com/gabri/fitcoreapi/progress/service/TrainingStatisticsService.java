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
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionStatus;
import com.gabri.fitcoreapi.exercise.domain.Equipment;
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
import java.util.function.Function;

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
                from,
                to,
                current.logs(),
                previous.logs()
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
                .findByUserIdAndStatusAndSessionDateBetweenOrderBySessionDateAsc(
                        userId, WorkoutSessionStatus.COMPLETED, from, to);
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
            LocalDate from,
            LocalDate to,
            List<ExerciseSetLog> currentLogs,
            List<ExerciseSetLog> previousLogs
    ) {
        GoalProfile goal = goals.findByUserAndActiveTrue(user).orElse(null);
        if (goal == null) {
            return insufficient(null, "goal.progress.no-active-goal", List.of("ACTIVE_GOAL_REQUIRED"));
        }

        WorkoutPlan plan = plans.findByUserAndActiveTrue(user).orElse(null);
        BigDecimal adherence = trainingAdherence(user.getId(), current.workouts(), plan, goal, from, to);
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
            // Comparar la MISMA variante y modalidad en ambos periodos.
            // El mejor 1RM de ejercicios distintos no es un indicador de progreso.
            BigDecimal trend = comparablePerformanceTrend(currentLogs,previousLogs);
            signals.add(new GoalSignalResponse("PERFORMANCE_TREND", signalForPositiveTrend(trend), trend));
            if (trend == null) {
                limitations.add("PREVIOUS_TRAINING_PERIOD_REQUIRED");
                return assessment(goal.getGoalType(), GoalProgressStatus.INSUFFICIENT_DATA,
                        AssessmentConfidence.LOW, trainingAligned, adherence, null, signals, limitations,
                        TargetProgress.empty());
            }
            GoalProgressStatus status = trend.compareTo(BigDecimal.ONE) > 0
                    ? GoalProgressStatus.APPROACHING
                    : (trend.compareTo(new BigDecimal("-2")) >= 0 && trainingAligned
                            ? GoalProgressStatus.ON_TRACK : GoalProgressStatus.NEEDS_ATTENTION);
            return assessment(goal.getGoalType(), status, AssessmentConfidence.MEDIUM,
                    trainingAligned, adherence, trend, signals, limitations, TargetProgress.empty());
        }

        List<ProgressRecord> goalRecords = goal.getStartDate().isAfter(to) ? List.of()
                : progressRecords.findByUserIdAndRecordDateBetweenOrderByRecordDateAsc(
                        user.getId(), goal.getStartDate(), to);

        if (records.size() < 2) {
            limitations.add("TWO_BODY_MEASUREMENTS_REQUIRED");
            return assessment(goal.getGoalType(), GoalProgressStatus.INSUFFICIENT_DATA,
                    AssessmentConfidence.LOW, trainingAligned, adherence, null, signals, limitations,
                    targetProgress(goal, goalRecords));
        }

        Outcome outcome = bodyOutcome(goal.getGoalType(), records);
        TargetProgress targetProgress = targetProgress(goal, goalRecords);
        signals.addAll(outcome.signals());
        limitations.addAll(outcome.limitations());
        if (outcome.desiredTrend() == null) {
            return assessment(goal.getGoalType(), GoalProgressStatus.INSUFFICIENT_DATA,
                    AssessmentConfidence.LOW, trainingAligned, adherence, null, signals, limitations, targetProgress);
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
                trainingAligned, adherence, outcome.desiredTrend(), signals, limitations, targetProgress);
    }

    private Outcome bodyOutcome(GoalType goalType, List<ProgressRecord> records) {
        List<GoalSignalResponse> signals = new ArrayList<>();
        List<String> limitations = new ArrayList<>();
        return switch (goalType) {
            case FAT_LOSS -> decreasingOutcome(records, signals, limitations);
            case MUSCLE_GAIN -> increasingOutcome(records, signals, limitations);
            case RECOMPOSITION -> recompositionOutcome(records, signals, limitations);
            case MAINTENANCE -> maintenanceOutcome(records, signals, limitations);
            case PERFORMANCE -> throw new IllegalStateException("Performance is assessed from training data");
        };
    }

    private Outcome decreasingOutcome(List<ProgressRecord> records,
            List<GoalSignalResponse> signals, List<String> limitations) {
        BigDecimal raw = smoothedChange(records, ProgressRecord::getBodyFatPercentage);
        AssessmentConfidence confidence = AssessmentConfidence.HIGH;
        String code = "BODY_FAT_TREND";
        if (raw == null) {
            raw = smoothedChange(records, ProgressRecord::getWeightKg);
            confidence = AssessmentConfidence.MEDIUM;
            code = "WEIGHT_TREND";
            limitations.add("BODY_FAT_MEASUREMENTS_RECOMMENDED");
        }
        BigDecimal desired = raw == null ? null : raw.negate();
        signals.add(new GoalSignalResponse(code, signalForPositiveTrend(desired), raw));
        return new Outcome(desired, confidence, signals, limitations);
    }

    private Outcome increasingOutcome(List<ProgressRecord> records,
            List<GoalSignalResponse> signals, List<String> limitations) {
        BigDecimal raw = smoothedChange(records, ProgressRecord::getMuscleMassKg);
        AssessmentConfidence confidence = AssessmentConfidence.HIGH;
        String code = "MUSCLE_MASS_TREND";
        if (raw == null) {
            raw = smoothedChange(records, ProgressRecord::getWeightKg);
            confidence = AssessmentConfidence.MEDIUM;
            code = "WEIGHT_TREND";
            limitations.add("MUSCLE_MASS_MEASUREMENTS_RECOMMENDED");
        }
        signals.add(new GoalSignalResponse(code, signalForPositiveTrend(raw), raw));
        return new Outcome(raw, confidence, signals, limitations);
    }

    private Outcome recompositionOutcome(List<ProgressRecord> records,
            List<GoalSignalResponse> signals, List<String> limitations) {
        BigDecimal fatChange = smoothedChange(records, ProgressRecord::getBodyFatPercentage);
        BigDecimal muscleChange = smoothedChange(records, ProgressRecord::getMuscleMassKg);
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

    private Outcome maintenanceOutcome(List<ProgressRecord> records,
            List<GoalSignalResponse> signals, List<String> limitations) {
        BigDecimal weightChange = smoothedChange(records, ProgressRecord::getWeightKg);
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

    private BigDecimal trainingAdherence(Long userId, long workouts, WorkoutPlan plan, GoalProfile goal,
            LocalDate from, LocalDate to) {
        Long configuredDays = goal.getTargetTrainingDaysPerWeek() == null
                ? null : goal.getTargetTrainingDaysPerWeek().longValue();
        if (configuredDays == null && (plan == null || plan.getWorkoutDays().isEmpty())) return null;
        long trainingDays = configuredDays != null ? configuredDays : plan.getWorkoutDays().stream()
                .filter(day -> day.getDayType() != com.gabri.fitcoreapi.workout.domain.WorkoutDayType.REST)
                .count();
        if (trainingDays == 0) return null;
        LocalDate effectiveStart = from;
        if (plan != null && plan.getStartDate().isAfter(effectiveStart)) effectiveStart = plan.getStartDate();
        if (goal.getStartDate().isAfter(effectiveStart)) effectiveStart = goal.getStartDate();
        if (effectiveStart.isAfter(to)) return null;
        if (effectiveStart.isAfter(from)) {
            workouts = sessions.findByUserIdAndStatusAndSessionDateBetweenOrderBySessionDateAsc(
                    userId, WorkoutSessionStatus.COMPLETED, effectiveStart, to).size();
        }
        long periodDays = ChronoUnit.DAYS.between(effectiveStart, to) + 1;
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
                AssessmentConfidence.LOW, false, null, null, summaryKey, List.of(), limitations,
                null, null, null, null, null);
    }

    private GoalProgressAssessmentResponse assessment(GoalType goalType, GoalProgressStatus status,
            AssessmentConfidence confidence, boolean trainingAligned, BigDecimal adherence, BigDecimal trend,
            List<GoalSignalResponse> signals, List<String> limitations, TargetProgress target) {
        return new GoalProgressAssessmentResponse(
                goalType, status, confidence, trainingAligned, adherence, trend,
                "goal.progress." + status.name().toLowerCase(Locale.ROOT).replace('_', '-'),
                List.copyOf(signals), List.copyOf(limitations), target.metric(), target.targetValue(),
                target.currentValue(), target.remaining(), target.completionPercent()
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

    private BigDecimal smoothedChange(List<ProgressRecord> records,
            Function<ProgressRecord, BigDecimal> extractor) {
        int window = smoothingWindow(records.size());
        BigDecimal first = average(records.subList(0, window), extractor);
        BigDecimal last = average(records.subList(records.size() - window, records.size()), extractor);
        return metricChange(first, last);
    }

    private BigDecimal average(List<ProgressRecord> records, Function<ProgressRecord, BigDecimal> extractor) {
        List<BigDecimal> values = records.stream().map(extractor).filter(Objects::nonNull).toList();
        if (values.isEmpty()) return null;
        return values.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(values.size()), 4, RoundingMode.HALF_UP);
    }

    private TargetProgress targetProgress(GoalProfile goal, List<ProgressRecord> records) {
        TargetMetric metric = targetMetric(goal);
        if (metric == null || records.isEmpty()) return TargetProgress.empty();
        int window = smoothingWindow(records.size());
        BigDecimal baseline = average(records.subList(0, window), metric.extractor());
        BigDecimal current = average(records.subList(records.size() - window, records.size()), metric.extractor());
        if (baseline == null || current == null) return new TargetProgress(metric.code(), metric.target(), current, null, null);
        BigDecimal remaining = metric.target().subtract(current).abs().setScale(2, RoundingMode.HALF_UP);
        BigDecimal initialDistance = metric.target().subtract(baseline).abs();
        BigDecimal completion = initialDistance.signum() == 0
                ? (remaining.signum() == 0 ? BigDecimal.valueOf(100) : BigDecimal.ZERO)
                : BigDecimal.ONE.subtract(remaining.divide(initialDistance, 6, RoundingMode.HALF_UP))
                        .multiply(BigDecimal.valueOf(100)).max(BigDecimal.ZERO).min(BigDecimal.valueOf(200))
                        .setScale(2, RoundingMode.HALF_UP);
        return new TargetProgress(metric.code(), metric.target(), current.setScale(2, RoundingMode.HALF_UP),
                remaining, completion);
    }

    private TargetMetric targetMetric(GoalProfile goal) {
        return switch (goal.getGoalType()) {
            case FAT_LOSS -> goal.getTargetBodyFatPercentage() != null
                    ? new TargetMetric("BODY_FAT_PERCENTAGE", goal.getTargetBodyFatPercentage(), ProgressRecord::getBodyFatPercentage)
                    : valueOrNull("WEIGHT_KG", goal.getTargetWeightKg(), ProgressRecord::getWeightKg);
            case MUSCLE_GAIN -> goal.getTargetMuscleMassKg() != null
                    ? new TargetMetric("MUSCLE_MASS_KG", goal.getTargetMuscleMassKg(), ProgressRecord::getMuscleMassKg)
                    : valueOrNull("WEIGHT_KG", goal.getTargetWeightKg(), ProgressRecord::getWeightKg);
            case RECOMPOSITION -> goal.getTargetBodyFatPercentage() != null
                    ? new TargetMetric("BODY_FAT_PERCENTAGE", goal.getTargetBodyFatPercentage(), ProgressRecord::getBodyFatPercentage)
                    : valueOrNull("MUSCLE_MASS_KG", goal.getTargetMuscleMassKg(), ProgressRecord::getMuscleMassKg);
            case MAINTENANCE -> valueOrNull("WEIGHT_KG", goal.getTargetWeightKg(), ProgressRecord::getWeightKg);
            case PERFORMANCE -> null;
        };
    }

    private int smoothingWindow(int recordCount) {
        return Math.min(3, Math.max(1, recordCount / 2));
    }

    private TargetMetric valueOrNull(String code, BigDecimal target,
            Function<ProgressRecord, BigDecimal> extractor) {
        return target == null ? null : new TargetMetric(code, target, extractor);
    }

    private BigDecimal percentChange(BigDecimal current, BigDecimal previous) {
        if (current == null || previous == null || previous.signum() == 0) return null;
        return current.subtract(previous).multiply(BigDecimal.valueOf(100))
                .divide(previous.abs(), 2, RoundingMode.HALF_UP);
    }


    /**
     * Comparable activity: same variant, same load mode and metric. Bodyweight
     * reps, seconds and barbell 1RM are distinct dimensions. Assisted/weighted
     * rep comparisons require identical extra load (no invented equivalence).
     */
    private BigDecimal comparablePerformanceTrend(
            List<ExerciseSetLog> current, List<ExerciseSetLog> previous) {
        Map<String, BigDecimal> currentBest=performanceByVariant(current);
        Map<String, BigDecimal> previousBest=performanceByVariant(previous);
        List<BigDecimal> changes=new ArrayList<>();
        for(var entry:currentBest.entrySet()){
            BigDecimal old=previousBest.get(entry.getKey());
            if(old==null||old.signum()<=0)continue;
            BigDecimal change=percentChange(entry.getValue(),old);
            if(change!=null)changes.add(change);
        }
        if(changes.isEmpty())return null;
        return changes.stream().reduce(BigDecimal.ZERO,BigDecimal::add)
                .divide(BigDecimal.valueOf(changes.size()),2,RoundingMode.HALF_UP);
    }

    private Map<String,BigDecimal> performanceByVariant(List<ExerciseSetLog> logs) {
        Map<String,BigDecimal> best=new HashMap<>();
        for(ExerciseSetLog log:logs){
            if(log.getWorkoutSessionExercise()==null ||
                    log.getWorkoutSessionExercise().getExerciseVariant()==null)continue;
            Long variantId=log.getWorkoutSessionExercise().getExerciseVariant().getId();
            if(variantId==null)continue;
            String mode=log.getLoadMode()==null?"EXTERNAL_LOAD":log.getLoadMode();
            String extra="";
            BigDecimal performance=null;
            if(log.getDurationSeconds()!=null&&log.getDurationSeconds()>0){
                performance=BigDecimal.valueOf(log.getDurationSeconds());
                extra=":SECONDS";
            }else if("EXTERNAL_LOAD".equals(mode)){
                performance=log.estimatedOneRepMax();
                extra=":ONE_RM";
            }else if(log.getReps()!=null&&log.getReps()>0){
                performance=BigDecimal.valueOf(log.getReps());
                if("WEIGHTED".equals(mode)){
                    if(log.getAddedWeightKg()==null)continue;
                    extra=":ADDED:"+log.getAddedWeightKg().stripTrailingZeros();
                }else if("ASSISTED".equals(mode)){
                    if(log.getAssistanceWeightKg()==null)continue;
                    extra=":ASSISTANCE:"+log.getAssistanceWeightKg().stripTrailingZeros();
                }else extra=":BODY_REPS";
            }
            if(performance==null||performance.signum()<=0)continue;
            best.merge(variantId+":"+mode+extra,performance,BigDecimal::max);
        }
        return best;
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
        return com.gabri.fitcoreapi.workout.domain.WorkoutPerformanceMath.externalVolume(log);
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

    private record TargetMetric(String code, BigDecimal target,
            Function<ProgressRecord, BigDecimal> extractor) {
    }

    private record TargetProgress(String metric, BigDecimal targetValue, BigDecimal currentValue,
            BigDecimal remaining, BigDecimal completionPercent) {
        private static TargetProgress empty() {
            return new TargetProgress(null, null, null, null, null);
        }
    }
}
