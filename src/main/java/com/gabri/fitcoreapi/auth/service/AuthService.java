package com.gabri.fitcoreapi.auth.service;

import com.gabri.fitcoreapi.auth.domain.UserCredential;
import com.gabri.fitcoreapi.auth.domain.UserRole;
import com.gabri.fitcoreapi.auth.dto.AuthResponse;
import com.gabri.fitcoreapi.auth.repository.UserCredentialRepository;
import com.gabri.fitcoreapi.common.exception.BusinessRuleException;
import com.gabri.fitcoreapi.common.i18n.MessageResolver;
import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.repository.UserRepository;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final UserCredentialRepository userCredentialRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtService jwtService;
    private final MessageResolver messageResolver;

    public AuthService(
            UserRepository userRepository,
            UserCredentialRepository userCredentialRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            CustomUserDetailsService customUserDetailsService,
            JwtService jwtService,
            MessageResolver messageResolver
    ) {
        this.userRepository = userRepository;
        this.userCredentialRepository = userCredentialRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.customUserDetailsService = customUserDetailsService;
        this.jwtService = jwtService;
        this.messageResolver = messageResolver;
    }

    public AuthResponse register(
            String name,
            String email,
            String rawPassword,
            Integer age,
            BigDecimal heightCm,
            BigDecimal weightKg
    ) {
        if (userRepository.existsByEmail(email) || userCredentialRepository.existsByUserEmail(email)) {
            throw new BusinessRuleException(
                    messageResolver.get("error.auth.emailAlreadyExists", email)
            );
        }

        User user = new User(name, email, age, heightCm, weightKg);
        user = userRepository.save(user);

        UserCredential credential = new UserCredential(
                user,
                passwordEncoder.encode(rawPassword),
                UserRole.USER
        );
        userCredentialRepository.save(credential);

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getId(), user.getEmail(), UserRole.USER.name());
    }

    public AuthResponse login(String email, String password) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
        } catch (BadCredentialsException ex) {
            throw new BusinessRuleException(
                    messageResolver.get("error.auth.invalidCredentials")
            );
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessRuleException(
                        messageResolver.get("error.auth.invalidCredentials")
                ));

        UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getId(), user.getEmail(), "USER");
    }
}
