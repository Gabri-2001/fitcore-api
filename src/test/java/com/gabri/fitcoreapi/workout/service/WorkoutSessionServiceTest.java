package com.gabri.fitcoreapi.workout.service;

import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.common.i18n.MessageResolver;
import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import com.gabri.fitcoreapi.exercise.repository.ExerciseMuscleActivationRepository;
import com.gabri.fitcoreapi.muscle.domain.MuscleGroup;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.*;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionExerciseRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutSessionRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkoutSessionServiceTest {
    @Mock WorkoutSessionRepository sessions;
    @Mock UserRepository users;
    @Mock EntityManager entityManager;
    @Mock MessageResolver messages;
    @Mock WorkoutSessionExerciseRepository sessionExercises;
    @Mock ExerciseMuscleActivationRepository activations;
    @InjectMocks WorkoutSessionService service;

    @Test
    void createsFreeSessionWithoutLegacyCategoryOrIntensity() {
        User user = mock(User.class);
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(sessions.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        WorkoutSession session = service.createWorkoutSession(7L, null, LocalDate.of(2026, 11, 22),
                null, null, null, null, null, WorkoutMuscleSelectionMode.AUTO, List.of());

        assertThat(session.getWorkoutDay()).isNull();
        assertThat(session.getSessionIntensity()).isNull();
        assertThat(session.getMuscleSelectionMode()).isEqualTo(WorkoutMuscleSelectionMode.AUTO);
        assertThat(session.getSessionExercises()).isEmpty();
    }

    @Test
    void copiesPlanPrescriptionAsIncompleteSetLogsWithoutMutatingPlan() {
        User user = mock(User.class);
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(user.getId()).thenReturn(7L);
        WorkoutDay day = mock(WorkoutDay.class);
        WorkoutPlan plan = mock(WorkoutPlan.class);
        when(entityManager.find(WorkoutDay.class, 12L)).thenReturn(day);
        when(day.getWorkoutPlan()).thenReturn(plan);
        when(plan.getUser()).thenReturn(user);
        ExerciseVariant variant = mock(ExerciseVariant.class);
        WorkoutExercise planned = new WorkoutExercise(variant, 3, 10, 75, 1);
        when(day.getWorkoutExercises()).thenReturn(List.of(planned));
        when(sessions.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        WorkoutSession session = service.createWorkoutSession(7L, 12L, LocalDate.of(2026, 11, 22),
                null, null, null, null, null, WorkoutMuscleSelectionMode.AUTO, List.of());

        assertThat(session.getWorkoutDay()).isSameAs(day);
        assertThat(session.getSessionExercises()).hasSize(1);
        WorkoutSessionExercise actual = session.getSessionExercises().getFirst();
        assertThat(actual.getWorkoutExercise()).isSameAs(planned);
        assertThat(actual.getRestSeconds()).isEqualTo(75);
        assertThat(actual.getSetLogs()).hasSize(3);
        assertThat(actual.getSetLogs()).extracting(ExerciseSetLog::getReps).containsExactly(10,10,10);
        assertThat(actual.getSetLogs()).allMatch(set -> !set.isCompleted() && set.getRir() == null
                && set.getRpe() == null && set.getWeight() == null);
        assertThat(planned.getSets()).isEqualTo(3);
        assertThat(planned.getReps()).isEqualTo(10);
    }

    @Test
    void rejectsManualModeWithoutMuscleGroups() {
        User user = mock(User.class);
        when(users.findById(7L)).thenReturn(Optional.of(user));
        assertThatThrownBy(() -> service.createWorkoutSession(7L, null,
                LocalDate.of(2026, 11, 22), null, null, null, null, null,
                WorkoutMuscleSelectionMode.MANUAL, List.of()))
                .isInstanceOf(BusinessRuleException.class);
        verify(sessions, never()).save(any());
    }

    @Test
    void rejectsPlanDayOwnedByAnotherUser() {
        User user = mock(User.class);
        User other = mock(User.class);
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(user.getId()).thenReturn(7L);
        when(other.getId()).thenReturn(8L);
        WorkoutDay day = mock(WorkoutDay.class);
        WorkoutPlan plan = mock(WorkoutPlan.class);
        when(entityManager.find(WorkoutDay.class, 12L)).thenReturn(day);
        when(day.getWorkoutPlan()).thenReturn(plan);
        when(plan.getUser()).thenReturn(other);
        assertThatThrownBy(() -> service.createWorkoutSession(7L, 12L,
                LocalDate.of(2026, 11, 22), null, null, null, null, null,
                WorkoutMuscleSelectionMode.AUTO, List.of()))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(sessions, never()).save(any());
    }

    @Test
    void returnsManualGroupsWithoutOverwritingExerciseStatistics() {
        WorkoutSession session = new WorkoutSession(LocalDate.of(2026, 11, 22), null, null, null, null, null);
        session.configureMuscleSelection(WorkoutMuscleSelectionMode.MANUAL, List.of(MuscleGroup.BACK, MuscleGroup.BICEPS));
        User user = mock(User.class);
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(sessions.findByIdAndUser(9L,user)).thenReturn(Optional.of(session));

        assertThat(service.getSessionMuscleGroups(7L, 9L)).containsExactly(MuscleGroup.BACK, MuscleGroup.BICEPS);
        verifyNoInteractions(sessionExercises, activations);
    }
}
