package com.gabri.fitcoreapi.auth.web;

import com.gabri.fitcoreapi.auth.dto.AuthResponse;
import com.gabri.fitcoreapi.auth.dto.LoginRequest;
import com.gabri.fitcoreapi.auth.dto.RegisterRequest;
import com.gabri.fitcoreapi.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

@Tag(name = "Authentication", description = "Authentication and registration operations")
@SecurityRequirements
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

    @Operation(summary = "Rotate a refresh token and obtain a new access token")
    @PostMapping("/refresh")
    public AuthResponse refresh(@Valid @RequestBody com.gabri.fitcoreapi.auth.dto.RefreshTokenRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @Operation(summary = "Revoke a refresh token")
    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@Valid @RequestBody com.gabri.fitcoreapi.auth.dto.RefreshTokenRequest request) {
        authService.logout(request.refreshToken());
    }

    @Operation(summary = "Change the authenticated user's password and revoke refresh sessions")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/change-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(Authentication authentication,
            @Valid @RequestBody com.gabri.fitcoreapi.auth.dto.ChangePasswordRequest request) {
        authService.changePassword(authentication.getName(), request.currentPassword(), request.newPassword());
    }
}
