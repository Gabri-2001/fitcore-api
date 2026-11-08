package com.gabri.fitcoreapi.user.web;

import com.gabri.fitcoreapi.user.dto.UserResponse;
import com.gabri.fitcoreapi.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;


@Tag(name = "Users", description = "Operations related to system users")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Get the authenticated user profile")
    @GetMapping("/me")
    public UserResponse getCurrentUser(Authentication authentication) {
        return UserResponse.from(userService.getCurrentUser(authentication.getName()));
    }

    @Operation(summary = "Get a user by id")
    @GetMapping("/{userId}")
    @PreAuthorize("@userAccess.isCurrentUser(#userId)")
    public UserResponse getUserById(@Parameter(description = "User id") @PathVariable Long userId) {
        return UserResponse.from(userService.getUserById(userId));
    }

}
