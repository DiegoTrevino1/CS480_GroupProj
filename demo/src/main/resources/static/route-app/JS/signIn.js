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
                // Send login request to the backend
                const response = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Valid credentials - UC2-FR2: Direct to the map page
                    // Store the userID for future API calls
                    sessionStorage.setItem('userID', data.userID);
                    sessionStorage.setItem('username', data.username);
                    window.location.href = 'mainPage.html';
                } else {
                    // Display error message from backend (UC2-FR3, UC2-FR4)
                    showMessage(data.error || "Invalid credentials", true);
                }
            } catch (error) {
                console.error('Sign In Error:', error);
                showMessage("Unable to connect to the server.", true);
            }
        });
    }
});
