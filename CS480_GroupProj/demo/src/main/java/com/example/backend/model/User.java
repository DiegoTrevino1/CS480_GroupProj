package com.example.backend.model;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

/*
 * @author Caden Pua
 * @date 3/3/2026
 * @file User.java
 * @version 0.4
 *
 * JPA column names match your ERD exactly:
 *   userId, username, password
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "userId")
    private int userID;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    // Stored as "salt$hash" — your original format
    @Column(name = "password", nullable = false, length = 255)
    private String passHash;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Route> routes;

    // Required by JPA
    protected User() {}

    public User(String username, String password) {
        this.username = username;
        this.passHash = hashPassword(password);
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    public int getUserID()      { return userID;   }
    public String getUsername() { return username; }
    public String getPassword() { return passHash; }

    // ── Password hashing — your original logic, unchanged ────────────────────

    private String hashPassword(String password) {
        try {
            byte[] salt = getSalt();
            return Base64.getEncoder().encodeToString(salt) + "$" + hash(password, salt);
        } catch (NoSuchAlgorithmException e) {
            System.out.println("ERROR : Hash algorithm failed.");
            e.printStackTrace();
            return null;
        }
    }

    private byte[] getSalt() throws NoSuchAlgorithmException {
        SecureRandom rand = SecureRandom.getInstanceStrong();
        byte[] salt = new byte[16];
        rand.nextBytes(salt);
        return salt;
    }

    private String hash(String password, byte[] salt) throws NoSuchAlgorithmException {
        MessageDigest mDigest = MessageDigest.getInstance("SHA-256");
        mDigest.update(salt);
        byte[] hashedPassword = mDigest.digest(password.getBytes());
        return Base64.getEncoder().encodeToString(hashedPassword);
    }

    public boolean checkPassword(String passCheck, String passStored) {
        try {
            String[] passTokens = passStored.split("\\$");
            byte[] salt = Base64.getDecoder().decode(passTokens[0]);
            String storedPass = passTokens[1];
            return storedPass.equals(hash(passCheck, salt));
        } catch (NoSuchAlgorithmException e) {
            System.out.println("ERROR : Hash algorithm failed.");
            e.printStackTrace();
            return false;
        }
    }
}