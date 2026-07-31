package com.gabri.fitcoreapi.auth.security;

import com.gabri.fitcoreapi.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component("userAccess")
public class UserAccess {
    private final UserRepository users;
    public UserAccess(UserRepository users) { this.users = users; }

    public boolean isCurrentUser(Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) return false;
        return users.findById(userId).map(user -> user.getEmail().equalsIgnoreCase(authentication.getName())).orElse(false);
    }
}
