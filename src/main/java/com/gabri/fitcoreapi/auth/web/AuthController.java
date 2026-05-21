package com.gabri.fitcoreapi.auth.web;

import com.gabri.fitcoreapi.auth.dto.AuthResponse;
import com.gabri.fitcoreapi.auth.dto.LoginRequest;
import com.gabri.fitcoreapi.auth.dto.RegisterRequest;
import com.gabri.fitcoreapi.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentication", description = "Authentication and registration operations")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Register a new user account")
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getAge(),
                request.getHeightCm(),
                request.getWeightKg()
        );
    }

    @Operation(summary = "Login and obtain a JWT token")
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(
                request.getEmail(),
                request.getPassword()
        );
    }
}