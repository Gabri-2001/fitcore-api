package com.gabri.fitcoreapi.auth.repository;

import com.gabri.fitcoreapi.auth.domain.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.Optional;

public interface UserCredentialRepository extends JpaRepository<UserCredential, Long> {

    @EntityGraph(attributePaths = "user")
    Optional<UserCredential> findByUserEmail(String email);

    boolean existsByUserEmail(String email);
}
