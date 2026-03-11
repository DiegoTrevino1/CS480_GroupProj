/**
 * Handles the logic for the Trinity Sign Up page (signUp.html)
 * Fulfills functional requirements UC1-FR1 to UC1-FR11
 */
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const usernameInput = document.getElementById('suUsername'); // UC1-FR2
    const passwordInput = document.getElementById('suPassword'); // UC1-FR10
    const confirmInput = document.getElementById('suConfirm'); // UC1-FR9
    const messageBox = document.getElementById('messageBox');

    // Initially hide the message and ensure it has styling
    messageBox.style.display = 'none';

    function showMessage(msg, isError = true) {
        messageBox.textContent = msg;
        messageBox.style.display = 'block';
        messageBox.style.color = isError ? 'red' : 'red';
    }

    // Helper to check password complexity (UC1-FR4, UC1-FR5)
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
            const password = passwordInput.value;
            const confirm = confirmInput.value;

            // UC1-FR8: Display "Please fill-in all inputs text fields" if any are empty
            if (!username || !password || !confirm) {
                showMessage("Please fill-in all inputs text fields", true);
                return;
            }

            // UC1-FR7: Display "Password and Confirm Password must match"
            if (password !== confirm) {
                showMessage("Password and Confirm Password must match", true);
                return;
            }

            // UC1-FR4 & UC1-FR5: Display password complexity error
            if (!validatePassword(password)) {
                showMessage("Password must be 8-30 characters and contain at least one instance of 3 of these 4 character types: uppercase, lowercase, special characters and numbers.", true);
                return;
            }

            // Mock Backend Validation
            // Let's simulate a network request delay of 500ms
            setTimeout(() => {
                // UC1-FR6: Display taken username message (mocking 'takenuser' as taken)
                if (username === 'takenuser') {
                    showMessage("Username is taken, please try a different username. ", true);
                    return;
                }

                // UC1-FR11: Mock adding a new row in the user table within the system records
                // UC1-FR3: Direct user to the sign in page after valid submission
                window.location.href = 'signIn.html';
                
            }, 500);
        });
    }
});
