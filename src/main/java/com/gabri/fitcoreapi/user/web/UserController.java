package com.gabri.fitcoreapi.user.web;

import com.gabri.fitcoreapi.user.domain.User;
import com.gabri.fitcoreapi.user.dto.CreateUserRequest;
import com.gabri.fitcoreapi.user.dto.UserResponse;
import com.gabri.fitcoreapi.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@RequestBody CreateUserRequest request) {
        User user = userService.createUser(
                request.getName(),
                request.getEmail(),
                request.getAge(),
                request.getHeightCm(),
                request.getWeightKg()
        );

        return UserResponse.from(user);
    }

    @GetMapping("/{userId}")
    public UserResponse getUserById(@PathVariable Long userId) {
        return UserResponse.from(userService.getUserById(userId));
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers()
                .stream()
                .map(UserResponse::from)
                .toList();
    }
}