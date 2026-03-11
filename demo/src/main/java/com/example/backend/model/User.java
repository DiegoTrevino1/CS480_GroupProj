package com.example.backend.model;

/*
 * @author Caden Pua
 * @date 3/3/2026
 * @file Account.java
 * @version 0.2
 * 
 * User class that stores a username and password. The password is stored
 * in a hashed form using SHA256. There are methods to generate the hashed
 * password as well as getters for the username and password.
 */

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

public class User {

    // Username and password
    private String userID;
    private String username;
    private String passHash; // using a SHA256 hash

    /*
     * @description Account constructor takes a username String and
     * a pasword provided by the user. The username is assigned
     * and the password is hashed using SHA256 and then stored
     * 
     * @param String username to allow logins and tracking of
     * accounts.
     * 
     * @param String password to be hashed then stored.
     */
    public User(String userID, String username, String password) {
        this.userID = userID;
        this.username = username;
        passHash = hashPassword(password);
    }

    /**
     * @description getter for username
     * 
     * @return String username
     */
    public String getUsername() {
        return username;
    }

    /**
     * @description getter for userID
     * 
     * @return String userID
     */
    public String getUserID() {
        return userID;
    }

    /*
     * @description getter for hashed password
     * 
     * @return String hashed password stored for account
     */
    public String getPassword() {
        return passHash;
    }

    /*
     * @description hashPassowrd takes in a plain text String
     * and hashes it using SHA256 and returns the encrypted
     * password to be stored.
     * 
     * @param String password plain text user defined pass
     * 
     * @return String hashed password with SHA256
     */
    private String hashPassword(String password) {
        try {
            byte[] salt = getSalt(); // get a random salt
            String hashedPass = hash(password, salt); // store hashed pass

            // return encrypted password
            return Base64.getEncoder().encodeToString(salt) + "$" + hashedPass;

        } catch (NoSuchAlgorithmException e) {
            System.out.println("ERROR : Hash algorithm failed.");
            e.printStackTrace();
            return null;
        }
    }

    /*
     * @description getSalt generates a new salt for hashing
     * 
     * @return byte[] containing the salt
     */
    private byte[] getSalt() throws NoSuchAlgorithmException {
        // use SecureRandom
        SecureRandom rand = SecureRandom.getInstanceStrong();
        byte[] salt = new byte[16]; // create array of bytes
        rand.nextBytes(salt); // fill away with random bytes
        return salt; // return the filled salt
    }

    /*
     * @description hash takes a password string and a salt and
     * hashes the password using the provided salt.
     * 
     * @param String password in plain text
     * 
     * @param byte[] salt as a byte array
     * 
     * @return String hashed password
     */
    private String hash(String password, byte[] salt) throws NoSuchAlgorithmException {
        // get SHA256 encryption
        MessageDigest mDigest = MessageDigest.getInstance("SHA-256");
        mDigest.update(salt); // update with salt
        // hash password
        byte[] hashedPassword = mDigest.digest(password.getBytes());

        // return hashed password encrypted
        return Base64.getEncoder().encodeToString(hashedPassword);
    }

    /*
     * @description checkPassword is a method to take password entered by
     * the user and check it against the stored password in its hash form
     * 
     * @param String password to be checked
     * 
     * @param String pasword stored as a hash
     * 
     * @return boolean indicating if the passwords are the same
     */
    public boolean checkPassword(String passCheck, String passStored) {
        try {
            // splits hashed password into the salt and the password
            String[] passTokens = passStored.split("\\$");

            // get salt
            byte[] salt = Base64.getDecoder().decode(passTokens[0]);
            String storedPass = passTokens[1];

            // hash the input password to check against the one stored
            String checkHash = hash(passCheck, salt);

            // compare the two hashed passwords and verify they are the same
            // return the boolean for their equality
            return storedPass.equals(checkHash);

        } catch (NoSuchAlgorithmException e) {
            System.out.println("ERROR : Hash algorithm failed.");
            e.printStackTrace();
            return false;
        }
    }

}