package com.example.backend.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

import org.springframework.stereotype.Service;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;

/*
 * @author Caden Pua
 * @date 3/3/2026
 * @file LoginManager.java
 * @version 0.3
 *
 * LoginManager — now a Spring @Service using UserRepository (JPA)
 * instead of calling DatabaseManager directly. All password checking
 * logic is unchanged from your original version.
 */
@Service
public class LoginManager {

    private final UserRepository userRepository;
    private String currentUser = null;

    public LoginManager(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /*
     * Login — looks up the user via JPA, then checks the password.
     */
    public boolean login(String username, String password) {
        return userRepository.findByUsername(username).map(user -> {
            if (checkPassword(password, user.getPassword())) {
                currentUser = username;
                System.out.println(username + " logged in successfully.");
                return true;
            } else {
                System.out.println("Incorrect password for user: " + username);
                return false;
            }
        }).orElseGet(() -> {
            System.out.println("Username not found.");
            return false;
        });
    }

    public void logOut() {
        currentUser = null;
    }

    /*
     * addUser — saves a new User via JPA.
     */
    public void addUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already taken: " + user.getUsername());
        }
        userRepository.save(user);
    }

    /*
     * removeUser — deletes by username via JPA.
     */
    public void removeUser(String username) {
        userRepository.findByUsername(username).ifPresentOrElse(
            userRepository::delete,
            () -> { throw new RuntimeException("User not found: " + username); }
        );
    }

    public String getCurrentUser() {
        return currentUser;
    }

    public User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    /*
     * checkPassword — your original logic, unchanged.
     */
    public boolean checkPassword(String passCheck, String passStored) {
        try {
            String[] passTokens = passStored.split("\\$");
            byte[] salt = Base64.getDecoder().decode(passTokens[0]);
            String storedPass = passTokens[1];
            String checkHash = hash(passCheck, salt);
            return storedPass.equals(checkHash);
        } catch (NoSuchAlgorithmException e) {
            System.out.println("ERROR : Hash algorithm failed.");
            e.printStackTrace();
            return false;
        }
    }

    private String hash(String password, byte[] salt) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(salt);
        byte[] hashedPassword = md.digest(password.getBytes());
        return Base64.getEncoder().encodeToString(hashedPassword);
    }
}