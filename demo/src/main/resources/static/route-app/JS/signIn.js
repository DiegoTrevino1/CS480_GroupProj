/**
 * Handles the logic for the Trinity Sign In page (signIn.html)
 * Fulfills functional requirements UC2-FR1 to UC2-FR7
 */
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const messageBox = document.getElementById('messageBox');

    // Initially hide the message and ensure it has styling
    messageBox.style.display = 'none';

    function showMessage(msg, isError = true) {
        messageBox.textContent = msg;
        messageBox.style.display = 'block';
        messageBox.style.color = isError ? 'red' : 'red';
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            // UC2-FR5: Display "Please fill-in all input text fields" if any are empty
            if (!username || !password) {
                showMessage("Please fill-in all input text fields", true);
                return;
            }

            try {
                // Mock Backend Validation for UC2-FR7
                // Since we are strictly doing frontend mocking:
                // Let's simulate a network request delay of 500ms
                setTimeout(() => {
                    // Valid credentials mockup
                    if (username === 'testuser' && password === 'testpass123') {
                        // UC2-FR2: Direct to the map page on valid credentials
                        window.location.href = 'mainPage.html';
                    } else {
                        // The requirements say to output "Invalid credentials." for both invalid username (UC2-FR4)
                        // and invalid password (UC2-FR3). 
                        showMessage("Invalid credentials", true);
                    }
                }, 500);
            } catch (error) {
                console.error('Sign In Error:', error);
                showMessage("Unable to connect to the server.", true);
            }
        });
    }
});
