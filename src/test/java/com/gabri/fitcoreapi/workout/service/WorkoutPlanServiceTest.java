package com.gabri.fitcoreapi.workout.service;

import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.WorkoutPlan;
import com.gabri.fitcoreapi.workout.domain.WorkoutDay;
import com.gabri.fitcoreapi.workout.domain.WorkoutDayType;
import com.gabri.fitcoreapi.workout.domain.WorkoutExercise;
import com.gabri.fitcoreapi.exercise.domain.Exercise;
import com.gabri.fitcoreapi.exercise.domain.ExerciseVariant;
import com.gabri.fitcoreapi.exercise.repository.ExerciseVariantRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutDayRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutExerciseRepository;
import com.gabri.fitcoreapi.workout.repository.WorkoutPlanRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkoutPlanServiceTest {

    @Mock
    private WorkoutPlanRepository workoutPlanRepository;

    @Mock
    private UserRepository userRepository;

    @Mock private ExerciseVariantRepository exerciseVariantRepository;
    @Mock private WorkoutDayRepository workoutDayRepository;
    @Mock private WorkoutExerciseRepository workoutExerciseRepository;

    @InjectMocks
    private WorkoutPlanService workoutPlanService;

    @Test
    void shouldCreateFirstWorkoutPlanWithVersionOne() {
        User user = new User("Gabriel", "gabriel@test.com", 24, null, null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(workoutPlanRepository.findByUserAndActiveTrue(user)).thenReturn(Optional.empty());
        when(workoutPlanRepository.save(any(WorkoutPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkoutPlan created = workoutPlanService.createWorkoutPlan(
                1L,
                "Push Pull Legs",
                "Initial plan",
                LocalDate.of(2026, 4, 25)
        );

        assertEquals(1, created.getVersion());
        assertTrue(created.isActive());
        assertNotNull(created.getPlanGroupId());
        assertNull(created.getPreviousPlan());
    }

    @Test
    void shouldCreateNewWorkoutPlanVersionUsingSamePlanGroupId() {
        User user = new User("Gabriel", "gabriel@test.com", 24, null, null);

        UUID groupId = UUID.randomUUID();
        WorkoutPlan previous = new WorkoutPlan(
                groupId,
                "Push Pull Legs",
                "Initial plan",
                1,
                true,
                LocalDate.of(2026, 4, 1),
                null
        );
        previous.setUser(user);

        LocalDate newStartDate = LocalDate.of(2026, 5, 1);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(workoutPlanRepository.findByUserAndActiveTrue(user)).thenReturn(Optional.of(previous));
        when(workoutPlanRepository.save(any(WorkoutPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WorkoutPlan created = workoutPlanService.createWorkoutPlan(
                1L,
                "Push Pull Legs v2",
                "Updated plan",
                newStartDate
        );

        assertEquals(2, created.getVersion());
        assertEquals(groupId, created.getPlanGroupId());
        assertEquals(previous, created.getPreviousPlan());

        assertFalse(previous.isActive());
        assertEquals(newStartDate.minusDays(1), previous.getEndDate());
    }

    @Test
    void shouldPersistAndReturnTheRequestedExerciseOrder() {
        User user = new User("Gabriel", "gabriel@test.com", 24, null, null);
        WorkoutPlan plan = new WorkoutPlan(UUID.randomUUID(), "Upper", null, 1, true,
                LocalDate.of(2026, 8, 2), null);
        plan.setUser(user);
        ReflectionTestUtils.setField(plan, "id", 20L);

        WorkoutDay day = new WorkoutDay("Upper day", 1, WorkoutDayType.UPPER);
        plan.addWorkoutDay(day);
        ReflectionTestUtils.setField(day, "id", 30L);
        WorkoutExercise first = workoutExercise(101L, "firstVariant", 1);
        WorkoutExercise second = workoutExercise(102L, "secondVariant", 2);
        day.addWorkoutExercise(first);
        day.addWorkoutExercise(second);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(workoutPlanRepository.findByIdAndUser(20L, user)).thenReturn(Optional.of(plan));
        when(workoutDayRepository.findByIdAndWorkoutPlanIdAndWorkoutPlanUserId(30L, 20L, 1L))
                .thenReturn(Optional.of(day));
        when(workoutExerciseRepository.findByWorkoutDayOrderByExerciseOrder(day))
                .thenReturn(java.util.List.of(first, second));

        var response = workoutPlanService.reorderExercises(1L, 20L, 30L, java.util.List.of(102L, 101L));

        assertEquals("secondVariant", response.exercises().getFirst().exerciseVariantCode());
        assertEquals(1, second.getExerciseOrder());
        assertEquals(2, first.getExerciseOrder());
        verify(workoutExerciseRepository).saveAll(java.util.List.of(first, second));
    }

    private WorkoutExercise workoutExercise(Long id, String variantCode, int order) {
        ExerciseVariant variant = mock(ExerciseVariant.class);
        Exercise exercise = mock(Exercise.class);
        when(variant.getCode()).thenReturn(variantCode);
        when(variant.getName()).thenReturn(variantCode);
        when(variant.getExercise()).thenReturn(exercise);
        when(exercise.getCode()).thenReturn("exercise");
        WorkoutExercise value = new WorkoutExercise(variant, 3, 10, 90, order);
        ReflectionTestUtils.setField(value, "id", id);
        return value;
    }
}
