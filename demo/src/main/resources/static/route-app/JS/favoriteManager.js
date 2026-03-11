// Favorite Manager Modal Logic

document.addEventListener("DOMContentLoaded", () => {
    const favoriteModal = document.getElementById('favorite-manager-modal');
    const openFavoritesBtn = document.getElementById('btn-view-favorites');
    const closeFavoritesBtn = document.getElementById('close-favorite-manager');

    // Open Modal
    if (openFavoritesBtn && favoriteModal) {
        openFavoritesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            favoriteModal.classList.add('active');
            renderFavoritesList(); // UC8-FR6: Ensure list is fresh when opened
        });
    }

    // Close Modal via X Button
    if (closeFavoritesBtn && favoriteModal) {
        closeFavoritesBtn.addEventListener('click', () => {
             favoriteModal.classList.remove('active');
        });
    }

    // Close Modal via clicking outside the content (optional, standard behavior)
    if (favoriteModal) {
        favoriteModal.addEventListener('click', (e) => {
             if (e.target === favoriteModal) {
                 favoriteModal.classList.remove('active');
             }
        });
    }
    
    // --- UC8: SAVE FAVORITE ROUTES LOGIC ---
    
    // Helper to get routes from LocalStorage
    function getFavorites() {
        const stored = localStorage.getItem('favoriteRoutes');
        return stored ? JSON.parse(stored) : [];
    }

    // Helper to save routes to LocalStorage
    function saveFavorites(favorites) {
        localStorage.setItem('favoriteRoutes', JSON.stringify(favorites));
    }

    // UC8-FR6: Display the list of user favorite routes
    function renderFavoritesList() {
        const container = document.querySelector('.route-list-container');
        if (!container) return;
        
        container.innerHTML = ''; // Clear existing
        const favorites = getFavorites();
        
        if (favorites.length === 0) {
            container.innerHTML = '<div style="padding:10px; color:#666;">No favorite routes saved yet.</div>';
            return;
        }

        favorites.forEach((route, index) => {
            const item = document.createElement('div');
            item.className = 'route-item';
            item.dataset.index = index;
            // Handle optional custom names, otherwise default to start - dest
            item.innerText = route.name || `${route.start} - ${route.dest}`;
            
            // Wire up basic selection highlighting
            item.addEventListener('click', function() {
                document.querySelectorAll('.route-item').forEach(r => r.classList.remove('selected'));
                this.classList.add('selected');
            });
            
            container.appendChild(item);
        });
    }

    // Initialize list on load if modal is somehow open
    renderFavoritesList();

    // UC8-FR1: The system allows the user to save a generated route as a favorite
    const heartIcons = document.querySelectorAll('.ar-favorite-row .btn-ar-fav');
    heartIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Extract route details (UC8-FR3)
            const startDisplay = document.getElementById('ar-start-display');
            const destDisplay = document.getElementById('ar-end-display');
            
            const startVal = startDisplay ? startDisplay.value : '';
            const destVal = destDisplay ? destDisplay.value : '';
            
            // Inline feedback helper (displays message below heart icon)
            const parentRow = icon.closest('.ar-favorite-row');
            if (parentRow) {
                parentRow.style.position = 'relative'; // Ensure absolute positioning anchor
            }
            
            const showInlineMessage = (msg, color) => {
                if (!parentRow) return;
                // Remove existing if spam-clicked
                let existingMsg = parentRow.querySelector('.inline-fav-msg');
                if (existingMsg) existingMsg.remove();
                
                const span = document.createElement('span');
                span.className = 'inline-fav-msg';
                span.style.color = color;
                span.style.fontWeight = 'bold';
                span.style.fontSize = '12px';
                span.style.transition = 'opacity 0.5s ease';
                span.style.position = 'absolute';
                span.style.top = '100%'; // Push directly below the heart icon
                span.style.left = '50%';
                span.style.transform = 'translate(-50%, 4px)'; // Center align it, add small gap
                span.style.whiteSpace = 'nowrap';
                span.style.pointerEvents = 'none'; // Prevent blocking clicks
                span.innerText = msg;
                
                parentRow.appendChild(span);
                
                // Fade out after 2 seconds
                setTimeout(() => {
                    span.style.opacity = '0';
                    setTimeout(() => span.remove(), 500);
                }, 2000);
            };

            if (!startVal || !destVal) {
                showInlineMessage("Cannot save empty route.", "#ef4444");
                return;
            }

            const favorites = getFavorites();
            const messageBox = document.getElementById('favorite-message');

            // UC8-FR2 & UC8-FR5: System checks that user has < 5 routes
            if (favorites.length >= 5) {
                // Inline feedback (FR5)
                showInlineMessage("Limit Reached (Max 5)", "#ef4444");
                
                // Modal feedback (FR5)
                if (messageBox) {
                    messageBox.style.color = '#ef4444'; // Red error text
                    messageBox.textContent = "Error: Maximum of 5 favorite routes reached.";
                }
                return;
            }

            // Check if route is already saved to prevent exact duplicates (Optional but good UX)
            const isDuplicate = favorites.some(r => r.start === startVal && r.dest === destVal);
            if (isDuplicate) {
                showInlineMessage("Already Saved!", "#ff9900");
                if (messageBox) {
                    messageBox.style.color = '#ff9900';
                    messageBox.textContent = "This route is already in your favorites.";
                }
                return;
            }

            // UC8-FR3: Store the route details in the system records (LocalStorage for demo)
            favorites.push({
                start: startVal,
                dest: destVal,
                name: '' // Empty custom name by default
            });
            saveFavorites(favorites);

            // UC8-FR6: Keep the list updated in the background
            renderFavoritesList();

            // UC8-FR4: Confirm to the user that the route has been successfully saved
            showInlineMessage("Saved!", "#ef4444"); // Inline success
            
            if (messageBox) {
                messageBox.style.color = '#ef4444';
                messageBox.textContent = "Route successfully saved!";
                // Clear message after 3 seconds so it doesn't linger forever
                setTimeout(() => {
                    if (messageBox.textContent === "Route successfully saved!") {
                        messageBox.textContent = "Message textbox field";
                        messageBox.style.color = '';
                    }
                }, 3000);
            }
        });
    });
    // ----------------------------------------

    // Load Route Confirmation Modal Logic
    const loadRouteBtn = document.getElementById('btn-load-route');
    const loadRouteModal = document.getElementById('load-route-modal');
    const loadRouteYesBtn = document.getElementById('load-route-yes');
    const loadRouteNoBtn = document.getElementById('load-route-no');

    if (loadRouteBtn && loadRouteModal) {
        loadRouteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Check if a route is actually selected before opening (optional logic)
            const selectedRoute = document.querySelector('.route-item.selected');
            if (selectedRoute) {
                loadRouteModal.classList.add('active');
            } else {
                const messageBox = document.getElementById('favorite-message');
                if (messageBox) {
                    messageBox.textContent = "Please select a route to load first.";
                }
            }
        });
    }

    if (loadRouteNoBtn && loadRouteModal) {
        loadRouteNoBtn.addEventListener('click', () => {
            loadRouteModal.classList.remove('active');
        });
    }

    if (loadRouteYesBtn && loadRouteModal) {
        loadRouteYesBtn.addEventListener('click', () => {
            const selectedRoute = document.querySelector('.route-item.selected');
            if (selectedRoute) {
                const index = parseInt(selectedRoute.dataset.index, 10);
                const favorites = getFavorites();
                const route = favorites[index];
                
                if (route) {
                    // UC9-FR7: Retrieve route details
                    const startInput = document.getElementById('start-location');
                    const destInput = document.getElementById('end-location');
                    const form = document.getElementById('routing-form');
                    const activePanel = document.getElementById('active-route-panel');
                    const btnRoute = document.getElementById('btn-route');
                    
                    if (startInput && destInput && btnRoute) {
                        // Populate inputs
                        startInput.value = route.start;
                        destInput.value = route.dest;
                        
                        // Toggle UI back to routing form so Google Maps API calculates it natively
                        if (form) form.style.display = 'flex';
                        if (activePanel) activePanel.style.display = 'none';
                        
                        // UC9-FR9: System displays map with driving directions...
                        // We achieve this by simply simulating a form submit click on the main Route button
                        btnRoute.click();
                    }
                }
            }
            // Close modals
            loadRouteModal.classList.remove('active');
            favoriteModal.classList.remove('active');
        });
    }

    // Delete Route Confirmation Modal Logic
    const deleteRouteBtn = document.getElementById('btn-remove-route');
    const deleteRouteModal = document.getElementById('delete-route-modal');
    const deleteRouteYesBtn = document.getElementById('delete-route-yes');
    const deleteRouteNoBtn = document.getElementById('delete-route-no');

    if (deleteRouteBtn && deleteRouteModal) {
        deleteRouteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedRoute = document.querySelector('.route-item.selected');
            if (selectedRoute) {
                deleteRouteModal.classList.add('active');
            } else {
                const messageBox = document.getElementById('favorite-message');
                if (messageBox) {
                    messageBox.textContent = "Please select a route to delete first.";
                }
            }
        });
    }

    if (deleteRouteNoBtn && deleteRouteModal) {
        deleteRouteNoBtn.addEventListener('click', () => {
            deleteRouteModal.classList.remove('active');
        });
    }

    if (deleteRouteYesBtn && deleteRouteModal) {
        deleteRouteYesBtn.addEventListener('click', () => {
            const selectedRoute = document.querySelector('.route-item.selected');
            if (selectedRoute) {
                const index = parseInt(selectedRoute.dataset.index, 10);
                const favorites = getFavorites();
                
                // Remove from LocalStorage array
                favorites.splice(index, 1);
                saveFavorites(favorites);
                
                // Re-render UI
                renderFavoritesList();
                
                // UC9-FR12: Display confirmation message
                const messageBox = document.getElementById('favorite-message');
                if (messageBox) {
                    messageBox.style.color = '#ef4444';
                    messageBox.textContent = "Favorite Routes has been updated.";
                    
                    setTimeout(() => {
                        if (messageBox.textContent === "Favorite Routes has been updated.") {
                            messageBox.textContent = "Message textbox field";
                            messageBox.style.color = '';
                        }
                    }, 4000);
                }
            }
            deleteRouteModal.classList.remove('active');
        });
    }

    // --- UC11: RENAME FAVORITE ROUTE LOGIC ---
    const renameRouteBtn = document.getElementById('btn-rename-route');
    const renameInputModal = document.getElementById('rename-input-modal');
    const closeRenameInputBtn = document.getElementById('close-rename-input');
    const confirmRenameBtn = document.getElementById('btn-confirm-rename');
    const nameInput = document.getElementById('route-new-name');
    
    const renameRouteModal = document.getElementById('rename-route-modal');
    const renameRouteYesBtn = document.getElementById('rename-route-yes');
    const renameRouteNoBtn = document.getElementById('rename-route-no');

    // State variable to temporarily hold the new name while waiting for confirmation
    let pendingNewName = "";

    // Step 1: Click "Rename Route" opens the Input Modal (UC11-FR1, FR2, FR3)
    if (renameRouteBtn && renameInputModal) {
        renameRouteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const selectedRoute = document.querySelector('.route-item.selected');
            if (selectedRoute) {
                // Show the input modal
                renameInputModal.classList.add('active');
                
                // Pre-fill input with existing text for convenience
                if (nameInput) {
                    nameInput.value = selectedRoute.textContent;
                    nameInput.focus();
                }
            } else {
                const messageBox = document.getElementById('favorite-message');
                if (messageBox) {
                    messageBox.textContent = "Please select a route to rename first.";
                }
            }
        });
    }

    // Close 'X' on Rename Input Modal
    if (closeRenameInputBtn && renameInputModal) {
        closeRenameInputBtn.addEventListener('click', () => {
            renameInputModal.classList.remove('active');
        });
    }

    // Step 2: Click "Confirm" on Input Modal opens Confirmation Modal (UC11-FR4, FR7)
    if (confirmRenameBtn && renameRouteModal) {
        confirmRenameBtn.addEventListener('click', () => {
            if (nameInput && nameInput.value.trim() !== '') {
                pendingNewName = nameInput.value.trim();
                // Close input modal and open confirmation modal
                renameInputModal.classList.remove('active');
                renameRouteModal.classList.add('active');
            }
        });
    }

    // Cancel ('No') on Confirmation Modal (UC11-FR8)
    if (renameRouteNoBtn && renameRouteModal) {
        renameRouteNoBtn.addEventListener('click', () => {
            renameRouteModal.classList.remove('active');
            pendingNewName = ""; // reset
        });
    }

    // Step 3: Click "Yes" on Confirmation Modal executes rename (UC11-FR5, FR6, FR8, FR9)
    if (renameRouteYesBtn && renameRouteModal) {
        renameRouteYesBtn.addEventListener('click', () => {
            const selectedRoute = document.querySelector('.route-item.selected');
            if (selectedRoute && pendingNewName !== "") {
                const index = parseInt(selectedRoute.dataset.index, 10);
                const favorites = getFavorites();
                
                // Update system records (Local Storage) (UC11-FR9)
                if (favorites[index]) {
                    favorites[index].name = pendingNewName;
                    saveFavorites(favorites);
                }
                
                // Update UI visually (UC11-FR5)
                renderFavoritesList();
                
                // Display confirmation message (UC11-FR6)
                const messageBox = document.getElementById('favorite-message');
                if (messageBox) {
                    messageBox.style.color = '#ef4444'; // Display in red
                    messageBox.textContent = "Favorite Routes has been updated.";
                    
                    setTimeout(() => {
                        if (messageBox.textContent === "Favorite Routes has been updated.") {
                            messageBox.textContent = "Message textbox field";
                            messageBox.style.color = '';
                        }
                    }, 4000);
                }
            }
            
            // Clean up states and close
            renameRouteModal.classList.remove('active');
            pendingNewName = "";
        });
    }

});
