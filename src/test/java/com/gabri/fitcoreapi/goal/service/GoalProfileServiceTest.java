package com.gabri.fitcoreapi.goal.service;

import com.gabri.fitcoreapi.goal.domain.GoalProfile;
import com.gabri.fitcoreapi.goal.domain.GoalType;
import com.gabri.fitcoreapi.goal.repository.GoalProfileRepository;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoalProfileServiceTest {

    @Mock
    private GoalProfileRepository goalProfileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private GoalProfileService goalProfileService;

    @Test
    void shouldCreateFirstGoalProfileWithVersionOne() {
        User user = new User("Gabriel", "gabriel@test.com", 24, null, null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(goalProfileRepository.findByUserAndActiveTrue(user)).thenReturn(Optional.empty());
        when(goalProfileRepository.save(any(GoalProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GoalProfile created = goalProfileService.createGoalProfile(
                1L,
                GoalType.MUSCLE_GAIN,
                new BigDecimal("3000"),
                new BigDecimal("180"),
                new BigDecimal("350"),
                new BigDecimal("80"),
                14,
                LocalDate.of(2026, 4, 25)
        );

        assertEquals(1, created.getVersion());
        assertTrue(created.isActive());
        assertNull(created.getPreviousGoalProfile());
    }

    @Test
    void shouldDeactivatePreviousGoalProfileAndCreateNewVersion() {
        User user = new User("Gabriel", "gabriel@test.com", 24, null, null);

        GoalProfile previous = new GoalProfile(
                GoalType.MUSCLE_GAIN,
                new BigDecimal("2800"),
                new BigDecimal("170"),
                new BigDecimal("320"),
                new BigDecimal("75"),
                14,
                1,
                true,
                LocalDate.of(2026, 4, 1),
                null
        );
        previous.setUser(user);

        LocalDate newStartDate = LocalDate.of(2026, 5, 1);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(goalProfileRepository.findByUserAndActiveTrue(user)).thenReturn(Optional.of(previous));
        when(goalProfileRepository.save(any(GoalProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GoalProfile created = goalProfileService.createGoalProfile(
                1L,
                GoalType.RECOMPOSITION,
                new BigDecimal("2600"),
                new BigDecimal("190"),
                new BigDecimal("250"),
                new BigDecimal("70"),
                10,
                newStartDate
        );

        assertEquals(2, created.getVersion());
        assertTrue(created.isActive());
        assertEquals(previous, created.getPreviousGoalProfile());

        assertFalse(previous.isActive());
        assertEquals(newStartDate.minusDays(1), previous.getEndDate());
    }
}