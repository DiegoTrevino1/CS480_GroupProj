package com.example.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.model.User;
import com.example.backend.service.LoginManager;

import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final LoginManager loginManager;

    public AuthController(LoginManager loginManager) {
        this.loginManager = loginManager;
    }

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpSession session) {
        boolean success = loginManager.login(req.username(), req.password());
        if (success) {
            User user = loginManager.getUser(req.username());
            session.setAttribute("userID",   user.getUserID());
            session.setAttribute("username", user.getUsername());
            return ResponseEntity.ok(Map.of(
                    "userID",   user.getUserID(),
                    "username", user.getUsername()
            ));
        }
        return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password."));
    }

    /** POST /api/auth/signup */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        if (!req.password().equals(req.confirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match."));
        }
        try {
            loginManager.addUser(new User(req.username(), req.password()));
            return ResponseEntity.ok(Map.of("message", "Account created successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
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
        try {
            loginManager.removeUser(req.username());
            loginManager.addUser(new User(req.username(), req.newPassword()));
            return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    record LoginRequest(String username, String password) {}
    record SignupRequest(String username, String password, String confirmPassword) {}
    record ResetPasswordRequest(String username, String newPassword, String confirmPassword) {}
}
