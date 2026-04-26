package com.gabri.fitcoreapi.nutrition.service;

import com.gabri.fitcoreapi.nutrition.domain.DietPlan;
import com.gabri.fitcoreapi.nutrition.repository.DietPlanRepository;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
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
class DietPlanServiceTest {

    @Mock
    private DietPlanRepository dietPlanRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DietPlanService dietPlanService;

    @Test
    void shouldCreateFirstDietPlanWithVersionOne() {
        User user = new User("Gabriel", "gabriel@test.com", 24, null, null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(dietPlanRepository.findByUserAndActiveTrue(user)).thenReturn(Optional.empty());
        when(dietPlanRepository.save(any(DietPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DietPlan created = dietPlanService.createDietPlan(
                1L,
                "Volume diet",
                "Initial diet",
                LocalDate.of(2026, 4, 25)
        );

        assertEquals(1, created.getVersion());
        assertTrue(created.isActive());
        assertNotNull(created.getPlanGroupId());
        assertNull(created.getPreviousPlan());
    }

    @Test
    void shouldCreateNewDietPlanVersionUsingSamePlanGroupId() {
        User user = new User("Gabriel", "gabriel@test.com", 24, null, null);

        UUID groupId = UUID.randomUUID();
        DietPlan previous = new DietPlan(
                groupId,
                "Volume diet",
                "Initial diet",
                1,
                true,
                LocalDate.of(2026, 4, 1),
                null
        );
        previous.setUser(user);

        LocalDate newStartDate = LocalDate.of(2026, 5, 1);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(dietPlanRepository.findByUserAndActiveTrue(user)).thenReturn(Optional.of(previous));
        when(dietPlanRepository.save(any(DietPlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DietPlan created = dietPlanService.createDietPlan(
                1L,
                "Volume diet v2",
                "Updated diet",
                newStartDate
        );

        assertEquals(2, created.getVersion());
        assertEquals(groupId, created.getPlanGroupId());
        assertEquals(previous, created.getPreviousPlan());

        assertFalse(previous.isActive());
        assertEquals(newStartDate.minusDays(1), previous.getEndDate());
    }
}