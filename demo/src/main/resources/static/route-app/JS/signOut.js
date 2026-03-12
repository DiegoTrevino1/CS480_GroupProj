/**
 * signOut.js
 * Handles the logic for firing the UC4 Sign Out Modal UI on the frontend.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Grab all respective interactive elements
    const btnSignout = document.getElementById('btn-signout');
    const modalOverlay = document.getElementById('sign-out-modal');
    const btnYes = document.getElementById('modal-yes');
    const btnNo = document.getElementById('modal-no');

    // Make sure elements exist before binding listeners
    if (btnSignout && modalOverlay && btnYes && btnNo) {
        
        // UC4-FR4: Open popup when explicitly requested
        btnSignout.addEventListener('click', (e) => {
            e.preventDefault();
            modalOverlay.classList.add('active'); // CSS toggle handles Display Flex -> Block rendering out of nothingness.
        });

        // "No" cancels the signout, unbinds the modal.
        btnNo.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });

        // UC4-FR1, UC4-FR2, UC4-FR3, UC4-FR5: Confirming Sign Out terminates session and routs to 'signIn.html'
        btnYes.addEventListener('click', async () => {
            try {
                // Call backend logout endpoint
                await fetch('http://localhost:8080/api/auth/logout', {
                    method: 'POST'
                });
            } catch (err) {
                console.error("Logout error", err);
            }
            
            // Front-End Logic: Terminate session data cleanly before routing
            sessionStorage.clear();
            localStorage.removeItem('userToken'); // Purge typical auth variables
            
            // Route
            window.location.href = 'signIn.html';
        });

        // Quality of Life fallback: Clicking the dark background overlay explicitly dismisses the modal
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });

    } else {
        console.error("Sign Out Modal Elements missing from DOM. Check HTML structures.");
    }
});
