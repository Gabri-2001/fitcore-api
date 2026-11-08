package com.gabri.fitcoreapi.user.web;

import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.validation.ValidationAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import com.gabri.fitcoreapi.config.SecurityConfig;
import com.gabri.fitcoreapi.auth.security.JwtAuthenticationFilter;
import org.springframework.context.MessageSource;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = UserController.class,
        excludeFilters = {
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class),
                @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtAuthenticationFilter.class)
        },
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                ValidationAutoConfiguration.class
        }
)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private MessageSource messageSource;

    @Test
    @DisplayName("Should return the authenticated user")
    void shouldReturnCurrentUser() throws Exception {
        User user = new User(
                "Gabriel",
                "gabriel@test.com",
                24,
                new BigDecimal("188.00"),
                new BigDecimal("88.00")
        );

        when(userService.getCurrentUser("gabriel@test.com")).thenReturn(user);

        mockMvc.perform(get("/api/users/me").principal(
                        new UsernamePasswordAuthenticationToken("gabriel@test.com", null)))
                .andExpect(status().isOk())
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
    @DisplayName("Should not expose a global user listing")
    void shouldNotExposeAllUsers() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isNotFound());
    }
}
