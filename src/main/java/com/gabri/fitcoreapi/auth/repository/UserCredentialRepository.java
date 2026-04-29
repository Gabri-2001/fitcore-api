package com.gabri.fitcoreapi.auth.repository;

import com.gabri.fitcoreapi.auth.domain.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserCredentialRepository extends JpaRepository<UserCredential, Long> {

    Optional<UserCredential> findByUserEmail(String email);

    boolean existsByUserEmail(String email);
}
