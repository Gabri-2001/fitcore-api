package com.gabri.fitcoreapi.auth.service;

import com.gabri.fitcoreapi.auth.domain.RefreshToken;
import com.gabri.fitcoreapi.auth.domain.UserCredential;
import com.gabri.fitcoreapi.auth.repository.RefreshTokenRepository;
import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
@Transactional
public class RefreshTokenService {
    private final RefreshTokenRepository repository;
    private final long expirationMillis;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository repository,
            @Value("${app.security.refresh-token.expiration-millis:2592000000}") long expirationMillis) {
        this.repository = repository;
        this.expirationMillis = expirationMillis;
    }

    public IssuedRefreshToken issue(UserCredential credential) {
        byte[] bytes = new byte[48];
        secureRandom.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        Instant expiresAt = Instant.now().plusMillis(expirationMillis);
        repository.save(new RefreshToken(credential, hash(raw), expiresAt));
        return new IssuedRefreshToken(raw, expiresAt);
    }

    public Rotation rotate(String rawToken) {
        RefreshToken existing = requireUsable(rawToken);
        existing.revoke(Instant.now());
        return new Rotation(existing.getUserCredential(), issue(existing.getUserCredential()));
    }

    public void revoke(String rawToken) {
        repository.findByTokenHash(hash(rawToken)).ifPresent(token -> token.revoke(Instant.now()));
    }

    public void revokeAll(UserCredential credential) {
        repository.revokeAllForCredential(credential.getId(), Instant.now());
    }

    private RefreshToken requireUsable(String rawToken) {
        RefreshToken token = repository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new BusinessRuleException("Invalid refresh token"));
        if (!token.isUsable(Instant.now())) throw new BusinessRuleException("Refresh token is expired or revoked");
        return token;
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    public record IssuedRefreshToken(String value, Instant expiresAt) { }
    public record Rotation(UserCredential credential, IssuedRefreshToken refreshToken) { }
}
