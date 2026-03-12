/**
 * Handles the logic for the Trinity Reset Password (Signed In) page
 * Fulfills functional requirements UC3-FR1 to UC3-FR11
 */
document.addEventListener('DOMContentLoaded', () => {
    const resetPwForm = document.getElementById('reset-pw-form');
    // Using querySelectorAll since the inputs do not have distinct IDs inside the HTML
    const inputs = document.querySelectorAll('.reset-pw-input');
    const currentPasswordInput = inputs[0]; // UC3-FR7
    const newPasswordInput = inputs[1];     // UC3-FR7
    const confirmInput = inputs[2];         // UC3-FR7 / UC3-FR8
    const messageBox = document.querySelector('#reset-pw-form .message-box');

    // Initially hide the message
    messageBox.style.display = 'none';

    // The user requested ALL error and success messages to be RED unless explicitly specified.
    // The functional requirements do not explicitly state a color for "Password Changed.", therefore it will be RED.
    function showMessage(msg) {
        messageBox.textContent = msg;
        messageBox.style.display = 'block';
        messageBox.style.color = 'red';
    }

    // Close Button Logic
    const btnCloseReset = document.getElementById('btn-close-reset');
    if (btnCloseReset) {
        btnCloseReset.addEventListener('click', () => {
            window.location.href = 'mainPage.html';
        });
    }

    // Helper to check password complexity (UC3-FR3, UC3-FR4)
    function validatePassword(password) {
        if (password.length < 8 || password.length > 30) return false;

        let typesCount = 0;
        if (/[A-Z]/.test(password)) typesCount++; // Uppercase
        if (/[a-z]/.test(password)) typesCount++; // Lowercase
        if (/[0-9]/.test(password)) typesCount++; // Numbers
        if (/[^A-Za-z0-9]/.test(password)) typesCount++; // Special characters

        return typesCount >= 3;
    }

    if (resetPwForm) {
        resetPwForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirm = confirmInput.value;

            // UC3-FR6: Display "Please fill-in all inputs text fields" if any are empty
            if (!currentPassword || !newPassword || !confirm) {
                showMessage("Please fill-in all inputs text fields");
                return;
            }

            // UC3-FR9: Display "New Password and Confirm Password must match."
            if (newPassword !== confirm) {
                showMessage("New Password and Confirm Password must match.");
                return;
            }

            // UC3-FR3 & UC3-FR4: Display password complexity error using the exact string provided
            if (!validatePassword(newPassword)) {
                showMessage("Password must be 8-30 characters and contain at least one instance of 3 of these 4 character types: uppercase, lowercase, special characters and numbers.");
                return;
            }

            const username = sessionStorage.getItem('username');
            if (!username) {
                showMessage("Session expired. Please sign in again.");
                setTimeout(() => window.location.href = 'signIn.html', 1500);
                return;
            }

            // Send reset request to the backend
            fetch('http://localhost:8080/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    username: username, 
                    newPassword: newPassword, 
                    confirmPassword: confirm 
                })
            })
            .then(response => {
                if (response.ok) {
                    // UC3-FR5: Display "Password Changed."
                    showMessage("Password Changed.");
                    
                    // UC3-FR10: Sign out user and direct them back to sign in page
                    sessionStorage.clear();
                    setTimeout(() => {
                        window.location.href = 'signIn.html';
                    }, 1500); // 1.5 seconds delay so they can read the success message before redirection
                } else {
                    return response.json().then(data => {
                        // Display error from backend (e.g invalid current password logic if it was tracked securely)
                        showMessage(data.error || "An error occurred changing your password.");
                    });
                }
            })
            .catch(error => {
                console.error('Reset Password Error:', error);
                showMessage("Unable to connect to the server.");
            });
        });
    }
});
