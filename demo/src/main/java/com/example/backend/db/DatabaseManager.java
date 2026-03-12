package com.example.backend.db;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import com.example.backend.model.User;

/**
 * Provides static utility methods to interact with the Trinity MySQL database,
 * including inserting and retrieving users.
 * 
 * Configuration is loaded from application.properties via system properties or environment variables.
 * You can also set these values directly before calling any database methods.
 */
public class DatabaseManager {

    /**
     * The url to find the database (local MySQL database)
     * Default: reads from spring.datasource.url property
     */
    public static String dburl = System.getProperty("spring.datasource.url", 
        "jdbc:mysql://localhost:3306/trinity_db?useSSL=false&serverTimezone=UTC");
    
    /**
     * Username for connecting to the database
     * Default: reads from spring.datasource.username property
     */
    public static String dbUserName = System.getProperty("spring.datasource.username", "root");
    
    /**
     * Password for connecting to the database
     * Default: reads from spring.datasource.password property
     */
    public static String dbPassword = System.getProperty("spring.datasource.password", "your_password_here");

    /**
     * Establishes and returns a connection to the database.
     * 
     * @return Connection object to the database
     * @throws SQLException if the connection fails
     */
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(dburl, dbUserName, dbPassword);
    }

    /**
     * Tests the database connection.
     */
    public static void connect() {
        try (Connection conn = getConnection()) {
            System.out.println("Connection successful");
        } catch (Exception exception) {
            System.out.println(exception);
        }
    }

    /**
     * Test method that inserts a sample user, emergency, and update.
     */
    public static void test() {
        User user = new User("ken", "123456");
        insertUser(user.getUsername(), user.getPassword());
    }

    /**
     * Inserts a new user into the users table.
     * 
     * @param userName     the username
     * @param passwordHash the hashed password
     */
    public static void insertUser(String username, String passwordHash) {
        try (Connection conn = getConnection()) {
            String query = "INSERT INTO users (userPasswordHash, userName) VALUES (?, ?)";
            PreparedStatement statement = conn.prepareStatement(query);
            statement.setString(1, passwordHash);
            statement.setString(2, username);
            statement.executeUpdate();
        } catch (Exception e) {
            System.out.println(e.toString());
        }
    }

    /**
     * Retrieves a user account based on the username.
     * 
     * @param userName the username to search for
     * @return an Account object or null if not found
     */
    public static User getUser(String username) {
        try (Connection conn = getConnection()) {
            String query = "SELECT * FROM users WHERE username = ?";
            PreparedStatement statement = conn.prepareStatement(query);
            statement.setString(1, username);
            ResultSet result = statement.executeQuery();
            if (result.next()) {
                return new User(
                        // result.getString("userID"),
                        result.getString("username"),
                        result.getString("userPasswordHash"));
            } else {
                return null;
            }
        } catch (Exception e) {
            System.out.println(e.toString());
            return null;
        }
    }
    
    public static void removeUser(String userID) {
        try (Connection conn = getConnection()) {
            String query = "DELETE FROM users WHERE userID = ?";
            PreparedStatement statement = conn.prepareStatement(query);
            statement.setString(1, userID);
            int rowsAffected = statement.executeUpdate();
    
            if (rowsAffected > 0) {
                System.out.println("User with ID " + userID + " removed successfully.");
            } else {
                System.out.println("No user found with ID " + userID + ".");
            }
        } catch (Exception e) {
            System.out.println(e.toString());
        }
    }

    /**
     * Main method for testing the database connection and sample operations.
     * 
     * @param args command-line arguments
     */
    public static void main(String[] args) {
        connect();
        test();
    }
}