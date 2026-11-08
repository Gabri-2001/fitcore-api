package com.gabri.fitcoreapi.auth.dto;

public class AuthResponse {

    private final String token;
    private final Long userId;
    private final String email;
    private final String role;
    private final String refreshToken;
    private final long expiresInSeconds;

    public AuthResponse(String token, Long userId, String email, String role) {
        this(token, userId, email, role, null, 0);
    }

    public AuthResponse(String token, Long userId, String email, String role,
            String refreshToken, long expiresInSeconds) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.role = role;
        this.refreshToken = refreshToken;
        this.expiresInSeconds = expiresInSeconds;
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

    public String getRefreshToken() { return refreshToken; }
    public long getExpiresInSeconds() { return expiresInSeconds; }
}
