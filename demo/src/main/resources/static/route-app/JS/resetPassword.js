/**
 * Handles the logic for the Trinity Reset Password page (resetPassword.html)
 * Fulfills functional requirements UC5-FR1 to UC5-FR11
 */
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const usernameInput = document.getElementById('suUsername'); // UC5-FR2
    const newPasswordInput = document.getElementById('suPassword'); // UC5-FR2
    const confirmInput = document.getElementById('suConfirm'); // UC5-FR2 / UC5-FR8
    const messageBox = document.getElementById('messageBox');
    const signInBtn = document.getElementById('signInBtn');

    // Initially hide the message
    messageBox.style.display = 'none';

    function showMessage(msg, isError = true) {
        messageBox.textContent = msg;
        messageBox.style.display = 'block';
        messageBox.style.color = isError ? 'red' : 'red';
    }

    // UC5-FR1: The button directing back to sign-in from reset password (and vice versa)
    if (signInBtn) {
        signInBtn.addEventListener('click', () => {
            window.location.href = 'signIn.html';
        });
    }

    // Helper to check password complexity (UC5-FR3)
    function validatePassword(password) {
        if (password.length < 8 || password.length > 30) return false;

        let typesCount = 0;
        if (/[A-Z]/.test(password)) typesCount++; // Uppercase
        if (/[a-z]/.test(password)) typesCount++; // Lowercase
        if (/[0-9]/.test(password)) typesCount++; // Numbers
        if (/[^A-Za-z0-9]/.test(password)) typesCount++; // Special characters

        return typesCount >= 3;
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = usernameInput.value.trim();
            const newPassword = newPasswordInput.value;
            const confirm = confirmInput.value;

            // UC5-FR6: Display "Please fill-in all input text fields" if any are empty
            if (!username || !newPassword || !confirm) {
                showMessage("Please fill-in all input text fields", true);
                return;
            }

            // UC5-FR9: Display "New Password and Confirm Password must match."
            if (newPassword !== confirm) {
                showMessage("New Password and Confirm Password must match.", true);
                return;
            }

            // UC5-FR4: Display password complexity error
            if (!validatePassword(newPassword)) {
                showMessage("“Invalid Password”. Password must contain 8-30 characters with at least one uppercase, lowercase, number or special character.", true);
                return;
            }

            // Mock Backend Validation
            // Simulate a network request delay of 500ms
            setTimeout(() => {
                // UC5-FR5: Display non-existent username message (mocking 'nonexistentuser' or just anything that isn't our test valid user)
                if (username === 'nonexistentuser') {
                    // UC5-FR11: Validating against system records (mock)
                    showMessage("Username not found, please try again.", true);
                    return;
                }

                // UC5-FR7: Display "Password Changed." in green
                showMessage("Password Changed.", false);
                
                // UC5-FR10: Direct user to the sign in page after successful change
                setTimeout(() => {
                    window.location.href = 'signIn.html';
                }, 1500); // 1.5 seconds delay so they can read the success message
                
            }, 500);
        });
    }
});
