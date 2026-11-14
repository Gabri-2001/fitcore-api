package com.gabri.fitcoreapi.workout.service;

import com.gabri.fitcoreapi.common.i18n.MessageResolver;
import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import com.gabri.fitcoreapi.exercise.repository.ExerciseVariantRepository;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.ExerciseSetLog;
import com.gabri.fitcoreapi.workout.domain.WorkoutSession;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionCategory;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionExercise;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionIntensity;
import com.gabri.fitcoreapi.workout.domain.WorkoutSessionStatus;
import com.gabri.fitcoreapi.workout.dto.PreviousExercisePerformanceResponse;
import com.gabri.fitcoreapi.workout.repository.WorkoutExerciseRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionExerciseRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkoutSessionExerciseServiceTest {

    @Mock WorkoutSessionExerciseRepository sessionExercises;
    @Mock WorkoutSessionRepository sessions;
    @Mock UserRepository users;
    @Mock WorkoutExerciseRepository workoutExercises;
    @Mock ExerciseVariantRepository variants;
    @Mock MessageResolver messages;
    @InjectMocks WorkoutSessionExerciseService service;

    @Test
    void shouldReturnCompletedSetsFromLatestPreviousSessionBySetNumber() {
        ExerciseVariant variant = mock(ExerciseVariant.class);
        when(variant.getId()).thenReturn(33L);
        WorkoutSession currentSession = session(22L, LocalDate.of(2026, 11, 13));
        WorkoutSessionExercise current = exercise(44L, currentSession, variant);
        WorkoutSession previousSession = session(21L, LocalDate.of(2026, 11, 10));
        WorkoutSessionExercise previous = exercise(43L, previousSession, variant);
        previous.addSetLog(new ExerciseSetLog(previous, 2, new BigDecimal("32.50"), 8, 1, new BigDecimal("9.0"), true, null));
        previous.addSetLog(new ExerciseSetLog(previous, 1, new BigDecimal("30.00"), 10, 2, new BigDecimal("8.0"), true, null));
        previous.addSetLog(new ExerciseSetLog(previous, 3, new BigDecimal("35.00"), 6, 0, new BigDecimal("10.0"), false, null));
        when(sessionExercises.findByIdAndWorkoutSessionUserId(44L, 7L)).thenReturn(Optional.of(current));
        when(sessionExercises.findFirstByWorkoutSessionUserIdAndExerciseVariantIdAndWorkoutSessionStatusAndWorkoutSessionIdNotAndWorkoutSessionSessionDateLessThanEqualOrderByWorkoutSessionSessionDateDescWorkoutSessionCompletedAtDesc(
                7L, 33L, WorkoutSessionStatus.COMPLETED, 22L, LocalDate.of(2026, 11, 13)))
                .thenReturn(Optional.of(previous));

        PreviousExercisePerformanceResponse response = service.getPreviousPerformance(7L, 22L, 44L);

        assertThat(response.sessionDate()).isEqualTo(LocalDate.of(2026, 11, 10));
        assertThat(response.sets()).extracting(PreviousExercisePerformanceResponse.PreviousSetResponse::setNumber)
                .containsExactly(1, 2);
        verify(sessionExercises).findFirstByWorkoutSessionUserIdAndExerciseVariantIdAndWorkoutSessionStatusAndWorkoutSessionIdNotAndWorkoutSessionSessionDateLessThanEqualOrderByWorkoutSessionSessionDateDescWorkoutSessionCompletedAtDesc(
                7L, 33L, WorkoutSessionStatus.COMPLETED, 22L, LocalDate.of(2026, 11, 13));
    }

    private WorkoutSession session(Long id, LocalDate date) {
        WorkoutSession session = new WorkoutSession(date, WorkoutSessionCategory.HYPERTROPHY,
                WorkoutSessionIntensity.MODERATE, null, null, null);
        ReflectionTestUtils.setField(session, "id", id);
        return session;
    }

    private WorkoutSessionExercise exercise(Long id, WorkoutSession session, ExerciseVariant variant) {
        WorkoutSessionExercise exercise = new WorkoutSessionExercise(
                null, variant, 90, false, 0, 0, null, null, null, null);
        ReflectionTestUtils.setField(exercise, "id", id);
        exercise.setWorkoutSession(session);
        return exercise;
    }
}
