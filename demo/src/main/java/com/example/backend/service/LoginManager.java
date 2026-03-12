package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;

/*
 * @author Caden Pua
 * @date 3/3/2026
 * @file LoginManager.java
 * @version 0.3
 * 
 * LoginManager class handles authentication logic by interacting with 
 * the UserRepository. Features include login, account creation, 
 * and account removal.
 */

@Service
public class LoginManager {

    private final UserRepository userRepository;

    // Currently logged in account username
    private String currentUser = null;

    /**
     * @description constructor for LoginManager
     * @param userRepository the JPA repository for user data
     */
    public LoginManager(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * @description method to log into an account by checking its username
     * and password.
     * 
     * @param username username to be checked
     * @param password password to be checked (in plain text)
     * @return boolean if account was successfully logged in
     */
    public boolean login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Using the User model's built-in checkPassword method
            if (user.checkPassword(password, user.getPassword())) {
                currentUser = username;
                System.out.println(username + " logged in successfully at " + LocalDateTime.now());
                return true;
            } else {
                System.out.println("Incorrect password for user: " + username);
                return false;
            }
        } else {
            System.out.println("Username not found: " + username);
            return false;
        }
    }

    /**
     * @description method to log out the current user.
     */
    public void logOut() {
        currentUser = null;
    }

    /**
     * @description method to add a user
     * @param user to be added
     */
    public void addUser(User user) {
        userRepository.save(user);
    }

    /**
     * @description method to remove a user by username
     * @param username to be removed
     */
    public void removeUser(String username) {
        userRepository.findByUsername(username).ifPresent(userRepository::delete);
    }

    /**
     * @description helper for signup and password reset to generate a hashed password string.
     * Handled by User model's constructor, but providing this for controller consistency.
     */
    public String generateHashedPassword(String plainPassword) {
        // We can just create a temporary User object to get a hashed password
        // or just let the AuthController create a new User(username, password).
        // For now, return a new User's hash for compatibility with existing flow if needed.
        return new User("tmp", plainPassword).getPassword();
    }

    public String getCurrentAccount() {
        return currentUser;
    }
}