package com.gabri.fitcoreapi.user.web;

import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.dto.CreateUserRequest;
import com.gabri.fitcoreapi.user.dto.UserResponse;
import com.gabri.fitcoreapi.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Users", description = "Operations related to system users")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @Operation(summary = "Create a new user")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        User user = userService.createUser(
                request.getName(),
                request.getEmail(),
                request.getAge(),
                request.getHeightCm(),
                request.getWeightKg()
        );

        return UserResponse.from(user);
    }

    @Operation(summary = "Get a user by id")
    @GetMapping("/{userId}")
    public UserResponse getUserById(@Parameter(description = "User id") @PathVariable Long userId) {
        return UserResponse.from(userService.getUserById(userId));
    }

    @Operation(summary = "Get all users")
    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers()
                .stream()
                .map(UserResponse::from)
                .toList();
    }


}