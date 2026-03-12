package com.example.backend.controller;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.LoginManager;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final LoginManager loginManager;
    private final UserRepository userRepository;

    public AuthController(LoginManager loginManager, UserRepository userRepository) {
        this.loginManager = loginManager;
        this.userRepository = userRepository;
    }

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpSession session) {
        boolean success = loginManager.login(req.username(), req.password());
        if (success) {
            Optional<User> userOpt = userRepository.findByUsername(req.username());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                session.setAttribute("userID",   user.getUserID());
                session.setAttribute("username", user.getUsername());
                return ResponseEntity.ok(Map.of(
                        "userID",   user.getUserID(),
                        "username", user.getUsername()
                ));
            }
        }
        return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password."));
    }

    /** POST /api/auth/signup */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        if (!req.password().equals(req.confirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match."));
        }
        
        if (userRepository.existsByUsername(req.username())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists."));
        }

        try {
            // User constructor handles hashing automatically
            User user = new User(req.username(), req.password());
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Account created successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create account: " + e.getMessage()));
        }
    }

    /** POST /api/auth/logout */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        loginManager.logOut();
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out."));
    }

    /** POST /api/auth/reset-password */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (!req.newPassword().equals(req.confirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match."));
        }
        
        Optional<User> userOpt = userRepository.findByUsername(req.username());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found."));
        }

        try {
            User user = userOpt.get();
            // Re-creating the user object (or we could add a setPassword to User that hashes)
            // For simplicity with existing User model, we'll replace the user.
            userRepository.delete(user);
            userRepository.save(new User(req.username(), req.newPassword()));
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update password: " + e.getMessage()));
        }
    }

    record LoginRequest(String username, String password) {}
    record SignupRequest(String username, String password, String confirmPassword) {}
    record ResetPasswordRequest(String username, String newPassword, String confirmPassword) {}
}
