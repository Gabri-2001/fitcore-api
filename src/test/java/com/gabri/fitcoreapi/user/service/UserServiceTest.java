package com.gabri.fitcoreapi.user.service;

import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.common.exception.ResourceNotFoundException;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User(
                "Gabriel",
                "gabriel@test.com",
                24,
                new BigDecimal("188.00"),
                new BigDecimal("88.00")
        );
    }

    @Test
    void shouldCreateUserWhenEmailDoesNotExist() {
        when(userRepository.existsByEmail("gabriel@test.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User createdUser = userService.createUser(
                "Gabriel",
                "gabriel@test.com",
                24,
                new BigDecimal("188.00"),
                new BigDecimal("88.00")
        );

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User savedUser = captor.getValue();

        assertEquals("Gabriel", createdUser.getName());
        assertEquals("gabriel@test.com", createdUser.getEmail());
        assertEquals("Gabriel", savedUser.getName());
        assertEquals("gabriel@test.com", savedUser.getEmail());
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("gabriel@test.com")).thenReturn(true);

        assertThrows(
                BusinessRuleException.class,
                () -> userService.createUser(
                        "Gabriel",
                        "gabriel@test.com",
                        24,
                        new BigDecimal("188.00"),
                        new BigDecimal("88.00")
                )
        );

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldReturnUserById() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        User foundUser = userService.getUserById(1L);

        assertEquals("gabriel@test.com", foundUser.getEmail());
    }

    @Test
    void shouldThrowWhenUserNotFoundById() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getUserById(99L));
    }

    @Test
    void shouldReturnAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(user));

        List<User> users = userService.getAllUsers();

        assertEquals(1, users.size());
        assertEquals("gabriel@test.com", users.get(0).getEmail());
    }
}