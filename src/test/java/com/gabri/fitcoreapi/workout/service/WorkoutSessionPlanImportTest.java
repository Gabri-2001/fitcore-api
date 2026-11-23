package com.gabri.fitcoreapi.workout.service;

import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.common.i18n.MessageResolver;
import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.*;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkoutSessionPlanImportTest {
    @Mock WorkoutSessionRepository sessions;
    @Mock UserRepository users;
    @Mock EntityManager entityManager;
    @Mock MessageResolver messages;
    @InjectMocks WorkoutSessionService service;

    private User user;

    @BeforeEach
    void prepare() {
        user = mock(User.class);
    }

    private WorkoutDay day(Long id) {
        WorkoutPlan plan = mock(WorkoutPlan.class);
        when(plan.getUser()).thenReturn(user);
        WorkoutDay day = new WorkoutDay("Espalda y pecho", 1, WorkoutDayType.UPPER);
        day.setWorkoutPlan(plan);
        ReflectionTestUtils.setField(day, "id", id);
        return day;
    }

    private WorkoutExercise planned(String code, int order, int sets, Integer reps, Integer duration,
                                    int rest, String resistanceSource) {
        ExerciseVariant variant = mock(ExerciseVariant.class);
        when(variant.getResistanceSource()).thenReturn(resistanceSource);
        WorkoutExercise planned = new WorkoutExercise(variant, sets, reps, rest, order, duration, null);
        return planned;
    }

    @Test
    void startingPlanDayCopiesAllExercisesAndPrescribedSetsInPlanOrder() {
        WorkoutDay day = day(21L);
        WorkoutExercise later = planned("timed", 2, 2, null, 45, 0, "BODYWEIGHT");
        WorkoutExercise first = planned("reps", 1, 3, 10, null, 90, "EXTERNAL_LOAD");
        day.addWorkoutExercise(later);
        day.addWorkoutExercise(first);
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(user.getId()).thenReturn(7L);
        when(entityManager.find(WorkoutDay.class, 21L)).thenReturn(day);
        when(sessions.save(any(WorkoutSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkoutSession result = service.createWorkoutSession(7L, 21L, LocalDate.of(2026,11,21),
                WorkoutSessionCategory.HYPERTROPHY, WorkoutSessionIntensity.MODERATE,
                null, null, null);

        assertSame(day, result.getWorkoutDay());
        assertEquals(2, result.getSessionExercises().size());
        WorkoutSessionExercise firstSession = result.getSessionExercises().get(0);
        WorkoutSessionExercise timedSession = result.getSessionExercises().get(1);
        assertSame(first, firstSession.getWorkoutExercise());
        assertEquals(90, firstSession.getRestSeconds());
        assertEquals(List.of(1,2,3), firstSession.getSetLogs().stream().map(ExerciseSetLog::getSetNumber).toList());
        assertEquals(List.of(10,10,10), firstSession.getSetLogs().stream().map(ExerciseSetLog::getReps).toList());
        assertTrue(firstSession.getSetLogs().stream().noneMatch(ExerciseSetLog::isCompleted));
        assertTrue(firstSession.getSetLogs().stream().allMatch(s -> "EXTERNAL_LOAD".equals(s.getLoadMode())));
        assertSame(later, timedSession.getWorkoutExercise());
        assertEquals(0, timedSession.getRestSeconds());
        assertEquals(List.of(45,45), timedSession.getSetLogs().stream().map(ExerciseSetLog::getDurationSeconds).toList());
        assertTrue(timedSession.getSetLogs().stream().allMatch(s -> s.getReps() == null));
        assertTrue(timedSession.getSetLogs().stream().allMatch(s -> "BODYWEIGHT".equals(s.getLoadMode())));
        assertTrue(result.getSessionExercises().stream().allMatch(s -> s.getWorkoutSession() == result));
        verify(sessions).save(result);
    }

    @Test
    void freeSessionDoesNotImportPlanExercises() {
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(sessions.save(any(WorkoutSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        WorkoutSession result = service.createWorkoutSession(7L, null, LocalDate.of(2026,11,21),
                WorkoutSessionCategory.STRENGTH, WorkoutSessionIntensity.MODERATE, null, null, null);
        assertNull(result.getWorkoutDay());
        assertTrue(result.getSessionExercises().isEmpty());
        verifyNoInteractions(entityManager);
    }

    @Test
    void recoveryImportsOnlyIntoEmptyOngoingLinkedSessions() {
        WorkoutDay day = new WorkoutDay("Pierna", 1, WorkoutDayType.LEGS);
        WorkoutExercise planned = planned("reps", 1, 2, 12, null, 60, "EXTERNAL_LOAD");
        day.addWorkoutExercise(planned);
        WorkoutSession session = new WorkoutSession(LocalDate.of(2026,11,21),
                WorkoutSessionCategory.STRENGTH, WorkoutSessionIntensity.MODERATE, null, null, null);
        session.setWorkoutDay(day);
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(sessions.findByIdAndUser(44L,user)).thenReturn(Optional.of(session));
        when(sessions.save(any(WorkoutSession.class))).thenAnswer(invocation -> invocation.getArgument(0));
        assertSame(session, service.importPlannedExercises(7L,44L));
        assertEquals(1, session.getSessionExercises().size());
        assertEquals(2, session.getSessionExercises().get(0).getSetLogs().size());

        assertThrows(BusinessRuleException.class, () -> service.importPlannedExercises(7L,44L));
        verify(sessions,times(1)).save(session);
    }

    @Test
    void recoveryRejectsFreeSessions() {
        WorkoutSession session = new WorkoutSession(LocalDate.of(2026,11,21),
                WorkoutSessionCategory.STRENGTH, WorkoutSessionIntensity.MODERATE, null, null, null);
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(sessions.findByIdAndUser(44L,user)).thenReturn(Optional.of(session));
        assertThrows(BusinessRuleException.class, () -> service.importPlannedExercises(7L,44L));
        verify(sessions,never()).save(any());
    }
}
