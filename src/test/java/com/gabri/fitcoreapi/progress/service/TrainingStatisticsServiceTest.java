package com.gabri.fitcoreapi.progress.service;

import com.gabri.fitcoreapi.exercise.repository.ExerciseMuscleActivationRepository;
import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.goal.domain.GoalType;
import com.gabri.fitcoreapi.goal.repository.GoalProfileRepository;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import com.gabri.fitcoreapi.progress.domain.GoalProgressStatus;
import com.gabri.fitcoreapi.progress.repository.ProgressRecordRepository;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.ExerciseSetLog;
import com.gabri.fitcoreapi.workout.repository.ExerciseSetLogRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutPlanRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Answers.RETURNS_DEEP_STUBS;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class TrainingStatisticsServiceTest {

    @Mock UserRepository users;
    @Mock WorkoutSessionRepository sessions;
    @Mock ExerciseSetLogRepository setLogs;
    @Mock ExerciseMuscleActivationRepository activations;
    @Mock GoalProfileRepository goals;
    @Mock WorkoutPlanRepository plans;
    @Mock ProgressRecordRepository progressRecords;

    @Test
    void reportsApproachingForPositivePerformanceTrend() {
        TrainingStatisticsService service = new TrainingStatisticsService(
                users, sessions, setLogs, activations, goals, plans, progressRecords);
        User user = new User("Gabriel", "gabriel@test.com", 24, null, null);
        GoalProfile goal = mock(GoalProfile.class);
        when(goal.getGoalType()).thenReturn(GoalType.PERFORMANCE);
        when(users.findById(1L)).thenReturn(Optional.of(user));
        when(goals.findByUserAndActiveTrue(user)).thenReturn(Optional.of(goal));
        when(plans.findByUserAndActiveTrue(user)).thenReturn(Optional.empty());
        when(sessions.findByUserIdAndStatusAndSessionDateBetweenOrderBySessionDateAsc(
                org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .thenReturn(List.of());

        ExerciseSetLog current = setLog("100.00", "80.00", 5, 10L);
        ExerciseSetLog previous = setLog("90.00", "70.00", 5, 10L);
        LocalDate from = LocalDate.of(2026, 7, 4);
        LocalDate to = LocalDate.of(2026, 8, 2);
        when(setLogs.findCompletedForStatistics(1L, from, to)).thenReturn(List.of(current));
        when(setLogs.findCompletedForStatistics(1L, from.minusDays(30), from.minusDays(1)))
                .thenReturn(List.of(previous));
        when(activations.findByExerciseVariantIdIn(List.of(10L))).thenReturn(List.of());
        when(progressRecords.findByUserIdAndRecordDateBetweenOrderByRecordDateAsc(1L, from, to))
                .thenReturn(List.of());

        var response = service.getStatistics(1L, from, to);

        assertEquals(GoalProgressStatus.APPROACHING, response.goalProgress().status());
        assertEquals(new BigDecimal("11.11"), response.comparison().oneRepMaxChangePercent());
        assertEquals(MuscleGroup.CHEST, response.muscleDistribution().getFirst().muscleGroup());
    }

    private ExerciseSetLog setLog(String oneRepMax, String weight, int reps, long variantId) {
        ExerciseSetLog log = mock(ExerciseSetLog.class, RETURNS_DEEP_STUBS);
        when(log.estimatedOneRepMax()).thenReturn(new BigDecimal(oneRepMax));
        when(log.getWeight()).thenReturn(new BigDecimal(weight));
        when(log.getReps()).thenReturn(reps);
        lenient().when(log.getWorkoutSessionExercise().getExerciseVariant().getId()).thenReturn(variantId);
        when(log.getWorkoutSessionExercise().getExerciseVariant().getExercise().getMainMuscleGroup())
                .thenReturn(MuscleGroup.CHEST);
        return log;
    }
}
