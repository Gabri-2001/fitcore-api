package com.gabri.fitcoreapi.auth.service;

import com.gabri.fitcoreapi.auth.domain.UserCredential;
import com.gabri.fitcoreapi.auth.repository.UserCredentialRepository;
import com.gabri.fitcoreapi.common.i18n.MessageResolver;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserCredentialRepository userCredentialRepository;
    private final MessageResolver messageResolver;

    public CustomUserDetailsService(
            UserCredentialRepository userCredentialRepository,
            MessageResolver messageResolver
    ) {
        this.userCredentialRepository = userCredentialRepository;
        this.messageResolver = messageResolver;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        UserCredential credential = userCredentialRepository.findByUserEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        messageResolver.get("error.auth.credentialsNotFound", email)
                ));

        return new org.springframework.security.core.userdetails.User(
                credential.getUser().getEmail(),
                credential.getPasswordHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + credential.getRole().name()))
        );
    }
}
