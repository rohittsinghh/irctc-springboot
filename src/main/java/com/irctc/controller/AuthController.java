package com.irctc.controller;

import com.irctc.model.User;
import com.irctc.service.UserBookingService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserBookingService userService;

    public AuthController(UserBookingService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public Map<String, String> signup(@RequestBody User user) {

        if (user.getName() == null || user.getPassword() == null) {
            return Map.of("error", "username_and_password_required");
        }

        boolean created = userService.signUp(user);

        if (!created) {
            return Map.of("error", "user_already_exists");
        }

        return Map.of("status", "signup_success");
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User user) {

        if (user.getName() == null || user.getPassword() == null) {
            return Map.of("error", "username_and_password_required");
        }

        boolean valid = userService.loginUser(
                user.getName(),
                user.getPassword()
        );

        if (!valid) {
            return Map.of("error", "invalid_credentials");
        }

        User loggedInUser = userService
                .getAllUsers()
                .stream()
                .filter(u -> u.getName().equals(user.getName()))
                .findFirst()
                .orElseThrow();

        return Map.of(
                "status", "login_success",
                "userId", loggedInUser.getUserId()
        );
    }
}
