package com.emotionmusic.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;

import com.emotionmusic.config.JwtUtil;
import com.emotionmusic.model.User;
import com.emotionmusic.service.UserService;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userService.existsByUsernameOrEmail(user.getUsername(), user.getEmail())) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Username or email already exists");
            return ResponseEntity.badRequest().body(response);
        }
        User savedUser = userService.registerUser(user);
        savedUser.setPassword(null); // Don't return password
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");
        Optional<User> userOpt = userService.loginUser(username, password);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setPassword(null);
            String token = jwtUtil.generateToken(user.getUsername(), user.getRoles().stream().map(Enum::name).collect(java.util.stream.Collectors.toSet()));
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", user.getUsername());
            response.put("roles", user.getRoles());
            return ResponseEntity.ok(response);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid username or password");
            return ResponseEntity.status(401).body(response);
        }
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout() {
        // For stateless JWT, logout is handled on the client by deleting the token
        return ResponseEntity.ok().body("Logged out successfully.");
    }

    @GetMapping("/admin/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adminTest() {
        return ResponseEntity.ok(Map.of("message", "You are an ADMIN!"));
    }

    @PostMapping("/admin/promote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> promoteToAdmin(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        Optional<User> userOpt = userService.findByUsername(username);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.getRoles().add(com.emotionmusic.model.Role.ADMIN);
            userService.save(user);
            return ResponseEntity.ok(Map.of("message", username + " promoted to ADMIN"));
        } else {
            return ResponseEntity.status(404).body(Map.of("message", "User not found"));
        }
    }
} 