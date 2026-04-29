package com.gabri.fitcoreapi.auth.dto;

public class AuthResponse {

    private final String token;
    private final Long userId;
    private final String email;
    private final String role;

    public AuthResponse(String token, Long userId, String email, String role) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}
