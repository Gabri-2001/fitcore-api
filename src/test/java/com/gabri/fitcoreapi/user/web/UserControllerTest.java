package com.gabri.fitcoreapi.user.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.validation.ValidationAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.MessageSource;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = UserController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                ValidationAutoConfiguration.class
        }
)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private MessageSource messageSource;

    @Test
    @DisplayName("Should create user and return 201")
    void shouldCreateUser() throws Exception {
        User user = new User(
                "Gabriel",
                "gabriel@test.com",
                24,
                new BigDecimal("188.00"),
                new BigDecimal("88.00")
        );

        ReflectionTestUtils.setField(user, "id", 1L);

        when(userService.createUser(any(), any(), any(), any(), any())).thenReturn(user);

        String requestBody = """
            {
              "name": "Gabriel",
              "email": "gabriel@test.com",
              "age": 24,
              "heightCm": 188.00,
              "weightKg": 88.00
            }
            """;

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/users/1"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Gabriel"))
                .andExpect(jsonPath("$.email").value("gabriel@test.com"));
    }

    @Test
    @DisplayName("Should return user by id")
    void shouldReturnUserById() throws Exception {
        User user = new User(
                "Gabriel",
                "gabriel@test.com",
                24,
                new BigDecimal("188.00"),
                new BigDecimal("88.00")
        );

        when(userService.getUserById(1L)).thenReturn(user);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Gabriel"))
                .andExpect(jsonPath("$.email").value("gabriel@test.com"));
    }

    @Test
    @DisplayName("Should return all users")
    void shouldReturnAllUsers() throws Exception {
        User user = new User(
                "Gabriel",
                "gabriel@test.com",
                24,
                new BigDecimal("188.00"),
                new BigDecimal("88.00")
        );

        when(userService.getAllUsers()).thenReturn(List.of(user));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Gabriel"))
                .andExpect(jsonPath("$[0].email").value("gabriel@test.com"));
    }
}