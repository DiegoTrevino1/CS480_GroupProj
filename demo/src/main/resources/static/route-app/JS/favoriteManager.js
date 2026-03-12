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
    
    // Helper to fetch routes from backend
    async function getFavorites() {
        const userID = sessionStorage.getItem('userID');
        if (!userID) return [];
        
        try {
            const response = await fetch(`http://localhost:8080/api/routes?userID=${userID}`);
            if (response.ok) {
                return await response.json();
            } else {
                console.error("Failed to fetch favorites");
                return [];
            }
        } catch (err) {
            console.error("Error fetching favorites", err);
            return [];
        }
    }

    // UC8-FR6: Display the list of user favorite routes
    async function renderFavoritesList() {
        const container = document.querySelector('.route-list-container');
        if (!container) return;
        
        container.innerHTML = '<div style="padding:10px; color:#666;">Loading...</div>'; 
        const favorites = await getFavorites();
        container.innerHTML = ''; // Clear existing
        
        if (favorites.length === 0) {
            container.innerHTML = '<div style="padding:10px; color:#666;">No favorite routes saved yet.</div>';
            return;
        }

        favorites.forEach((route, index) => {
            const item = document.createElement('div');
            item.className = 'route-item';
            // Store the routeID and data object in the dataset for access later
            item.dataset.routeId = route.routeID;
            item.dataset.index = index;
            // Store a JSON representation of the route object on the element for loading it easily
            item.dataset.fullRoute = JSON.stringify(route); 

            // Use the actual database Name property
            item.innerText = route.name || `Route ${route.routeID}`;
            
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

    // UC8-FR1: Save Route logic is now securely handled within mapLogic.js via the POST /api/routes endpoint.
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
            if (selectedRoute && selectedRoute.dataset.fullRoute) {
                try {
                    const route = JSON.parse(selectedRoute.dataset.fullRoute);
                    
                    // UC9-FR7: Retrieve route details from full JSON
                    const startInput = document.getElementById('start-location');
                    const destInput = document.getElementById('end-location');
                    const form = document.getElementById('routing-form');
                    const activePanel = document.getElementById('active-route-panel');
                    const btnRoute = document.getElementById('btn-route');
                    const wpList = document.getElementById('ar-waypoints-list');
                    const btnAddWp = document.getElementById('btn-ar-add-wp');
                    
                    if (startInput && destInput && btnRoute) {
                        // Reset existing waypoints up front
                        if (wpList) wpList.innerHTML = '';
                        if (window.waypointManager) window.waypointManager.count = 0;

                        // Parse Stops
                        route.stops.forEach(stop => {
                            if (stop.stopType === "ORIGIN") {
                                startInput.value = stop.addressString;
                            } else if (stop.stopType === "DESTINATION") {
                                destInput.value = stop.addressString;
                            } else if (stop.stopType === "WAYPOINT") {
                                // Add a waypoint row dynamically
                                if (btnAddWp) {
                                    btnAddWp.click();
                                    // The click creates a new row at the bottom synchronously
                                    const wpInputs = wpList.querySelectorAll('.waypoint-val');
                                    if (wpInputs.length > 0) {
                                        wpInputs[wpInputs.length - 1].value = stop.addressString;
                                    }
                                }
                            }
                        });
                        
                        // Toggle UI back to routing form so Google Maps API calculates it natively
                        if (form) form.style.display = 'flex';
                        if (activePanel) activePanel.style.display = 'none';
                        
                        // UC9-FR9: System displays map with driving directions
                        btnRoute.click();
                    }
                } catch(e) {
                    console.error("Error parsing saved route data:", e);
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
        deleteRouteYesBtn.addEventListener('click', async () => {
            const selectedRoute = document.querySelector('.route-item.selected');
            if (selectedRoute) {
                const routeId = selectedRoute.dataset.routeId;
                
                try {
                    const response = await fetch(`http://localhost:8080/api/routes/${routeId}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
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
                    } else {
                        console.error('Failed to delete route.');
                    }
                } catch (error) {
                    console.error('Error deleting route:', error);
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
        renameRouteYesBtn.addEventListener('click', async () => {
            const selectedRoute = document.querySelector('.route-item.selected');
            if (selectedRoute && pendingNewName !== "") {
                const routeId = selectedRoute.dataset.routeId;

                try {
                    const response = await fetch(`http://localhost:8080/api/routes/${routeId}/rename`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: pendingNewName })
                    });

                    if (response.ok) {
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
                    } else {
                        console.error('Failed to rename route.');
                    }
                } catch (error) {
                    console.error('Error renaming route:', error);
                }
            }
            
            // Clean up states and close
            renameRouteModal.classList.remove('active');
            pendingNewName = "";
        });
    }

});
