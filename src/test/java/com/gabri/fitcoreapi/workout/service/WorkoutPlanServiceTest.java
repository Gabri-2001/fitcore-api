package com.gabri.fitcoreapi.workout.service;

import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import com.gabri.fitcoreapi.workout.domain.WorkoutPlan;
import com.gabri.fitcoreapi.workout.repository.WorkoutPlanRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
}