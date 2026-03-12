let map;
let directionsService;
let directionsRenderer;
let alternateRenderers = []; // UC7-FR11: Track alternate route renderers to clear them later

// Ensure this is globally attached to window so the Google Maps async defer loader can callback to it natively
window.initMap = function() {
    console.log("Initializing Google Maps API...");
    
    // 1. Instantiate the map centered roughly on Seattle/Bellevue
    map = new google.maps.Map(document.getElementById('map-view'), {
        center: { lat: 47.6062, lng: -122.3321 },
        zoom: 12,
        disableDefaultUI: true // Completely disables all default Google Maps controls
    });

    // 2. Initialize Routing Services
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false, // Let Google draw default start/end markers
        polylineOptions: {
            strokeColor: '#33ccff', // Light blue for primary route
            strokeOpacity: 0.8,
            strokeWeight: 5,
            zIndex: 10 // Ensure primary route always stays on top of alternates
        }
    });

    // 3. Current Location Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // Add a simple "You Are Here" marker
                new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: "Your Location",
                    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
                });
                
                map.setCenter(pos);
            },
            () => {
                console.log("Geolocation blocked or failed.");
            }
        );
    }

    // Bind UI Event Listeners after initialization
    bindMapEventListeners();
};

// --- HELPER FUNCTION: CLEAR ALTERNATE ROUTES ---
function clearAlternateRoutes() {
    alternateRenderers.forEach(renderer => renderer.setMap(null));
    alternateRenderers = [];
}

// --- HELPER FUNCTION: RENDER ALTERNATE ROUTES ---
function renderAlternateRoutes(result) {
    clearAlternateRoutes();
    
    // Loop through the remaining routes (index 1 and onward)
    for (let i = 1; i < result.routes.length; i++) {
        // Use native Polyline drawing instead of heavy DirectionsRenderers
        // This is much more reliable for layering alternate paths
        const altRoute = result.routes[i];
        
        const altPolyline = new google.maps.Polyline({
            path: altRoute.overview_path,
            map: map,
            strokeColor: '#555555', // Dark grey for alternate routes
            strokeOpacity: 0.7,
            strokeWeight: 6,
            zIndex: 1 // Keep strictly underneath the primary route (which is zIndex 10)
        });
        
        alternateRenderers.push(altPolyline);
    }
}

// --- HELPER FUNCTION: FINALIZE MAIN RENDERING ---
function finalizeRouteRendering(result, origin, destination) {
    clearAlternateRoutes();
    directionsRenderer.setDirections(result);
    renderAlternateRoutes(result);
    renderRouteInfo(result, origin, destination);
}

function bindMapEventListeners() {
    const form = document.getElementById('routing-form');
    const startInput = document.getElementById('start-location');
    const destInput = document.getElementById('end-location');
    const btnRoute = document.getElementById('btn-route');
    const btnCancel = document.getElementById('btn-cancel');
    const estTime = document.getElementById('ar-time-display');
    const estDist = document.getElementById('ar-dist-display');
    const loadingOverlay = document.getElementById('map-loading');
    
    // Safety check just in case we are on a page without routing UI
    if (!form || !btnRoute) return;
    
    const errorMsgBox = document.getElementById('routing-error-msg');
    function showRoutingError(msg) {
        if (errorMsgBox) {
            errorMsgBox.innerText = msg;
            errorMsgBox.style.display = 'block';
        } else {
            alert(msg);
        }
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (errorMsgBox) errorMsgBox.style.display = 'none';

        const origin = startInput.value.trim();
        const destination = destInput.value.trim();

        if (!origin || !destination) {
            showRoutingError('Please fill-in all input text fields');
            return;
        }

        // Show loading state
        if (loadingOverlay) loadingOverlay.style.display = 'flex';
        btnRoute.disabled = true;
        btnRoute.innerHTML = '<span>Routing...</span>';
        
        // Fire request to Google Maps Directions API
        const request = {
            origin: origin,
            destination: destination,
            travelMode: 'DRIVING',
            provideRouteAlternatives: true // UC7-FR11: Request multiple routes
        };

        directionsService.route(request, (result, status) => {
            // Revert route button UI
            if (loadingOverlay) loadingOverlay.style.display = 'none';
            btnRoute.disabled = false;
            btnRoute.innerHTML = '<span>Route</span>';

            if (status === 'OK') {
                // UC7-FR12: Limit to a maximum of 3 alternate routes (4 routes total: 1 main + 3 alternates)
                if (result.routes && result.routes.length > 4) {
                    result.routes = result.routes.slice(0, 4);
                }
                
                // --- FORCE ALTERNATE ROUTE HACK ---
                // If Google only returns 1 route, we forcefully ask for a non-highway alternative
                if (result.routes.length === 1) {
                    let fallbackReq = Object.assign({}, request);
                    fallbackReq.avoidHighways = true;
                    directionsService.route(fallbackReq, (altResult, altStatus) => {
                        if (altStatus === 'OK' && altResult.routes.length > 0) {
                            // Ensure the new alternate route is physically different before injecting it
                            if (result.routes[0].overview_polyline !== altResult.routes[0].overview_polyline) {
                                result.routes.push(altResult.routes[0]);
                            }
                        }
                        finalizeRouteRendering(result, origin, destination);
                    });
                    return; // Yield execution until the fallback resolves
                }

                // Normal execution
                finalizeRouteRendering(result, origin, destination);
                // ---------------------------------------------
            } else {
                console.error("Directions request failed due to " + status);
                
                // If the user's API Key isn't active, Google will reject the routing.
                // We'll alert the user to help them debug.
                if (status === 'REQUEST_DENIED') {
                    alert('Route calculation completely blocked by Google! Your API key is likely missing, invalid, or billing is not enabled.');
                } else if (status === 'ZERO_RESULTS' || status === 'NOT_FOUND') {
                    // UC7-FR10: User entered an invalid city
                    showRoutingError('Invalid City');
                } else {
                    showRoutingError('Unable to calculate route: ' + status);
                }
            }
        });
    });

    if (btnCancel) {
        btnCancel.addEventListener('click', (e) => {
            e.preventDefault();

            // Clear inputs
            startInput.value = '';
            destInput.value = '';
            
            // Clear Waypoints
            const wpList = document.getElementById('ar-waypoints-list');
            if (wpList) wpList.innerHTML = '';
            // Reset counter directly via DOM
            if (window.waypointManager) window.waypointManager.count = 0;

            // Un-draw path from map by passing an empty set of routes
            directionsRenderer.setDirections({routes: []});
            clearAlternateRoutes();
            console.log("Route cleared via Cancel button.");
        });
    }

    // Phase 1: Back arrow logic to return to search UI
    const btnBackSearch = document.getElementById('btn-back-search');
    if (btnBackSearch) {
        btnBackSearch.addEventListener('click', (e) => {
            e.preventDefault();
            const activeRoutePanel = document.getElementById('active-route-panel');
            const userNavAll = document.querySelectorAll('.user-nav');
            const resetPwSectionAll = document.querySelectorAll('.reset-pw-section');
            const favRowAll = document.querySelectorAll('.ar-favorite-row');
            
            if(form && activeRoutePanel) {
                activeRoutePanel.style.display = 'none';
                form.style.display = 'flex'; 
                
                // Show unused items in sidebar bottom / body
                userNavAll.forEach(el => el.style.display = 'flex'); // reset
                resetPwSectionAll.forEach(el => el.style.display = 'flex'); // reset
                // Hide fav row
                favRowAll.forEach(el => el.style.display = 'none');
                
                // Clear waypoints when going back (UC7-FR13 Reset)
                const wpList = document.getElementById('ar-waypoints-list');
                if (wpList) wpList.innerHTML = '';
                if (window.waypointManager) window.waypointManager.count = 0;
            }
        });
    }

    // --- PHASE 8: WAYPOINT UI LOGIC (UC7-FR13) ---
    const btnAddWp = document.getElementById('btn-ar-add-wp');
    const wpList = document.getElementById('ar-waypoints-list');
    
    // Store count globally so we can reset it on Back/Cancel
    if (!window.waypointManager) window.waypointManager = { count: 0 };
    const MAX_WAYPOINTS = 5;

    if (btnAddWp && wpList) {
        btnAddWp.addEventListener('click', (e) => {
            e.preventDefault();
            // Recalculate based on physical DOM elements to be absolutely safe
            window.waypointManager.count = wpList.querySelectorAll('.ar-waypoint-controls').length;
            
            if (window.waypointManager.count >= MAX_WAYPOINTS) {
                alert("Maximum of 5 waypoints allowed.");
                return;
            }
            // Increment
            window.waypointManager.count++;
            
            const wpRow = document.createElement('div');
            wpRow.className = 'ar-waypoint-controls';
            wpRow.style.display = 'flex';
            wpRow.style.alignItems = 'center';
            wpRow.style.gap = '8px';
            wpRow.style.marginTop = '4px';
            
            wpRow.innerHTML = `
                <button class="btn-icon-circle" aria-label="Add" disabled style="opacity:0.5">+</button>
                <input type="text" class="ar-input waypoint-val" placeholder="Add stop..." style="flex:1;">
                <button class="btn-icon-clear btn-remove-wp" aria-label="Remove">x</button>
            `;
            
            wpList.appendChild(wpRow);

            // Auto-calculate the route when the user finishes typing (clicks away or hits Enter)
            const newWpInput = wpRow.querySelector('.waypoint-val');
            newWpInput.addEventListener('change', () => {
                const btnArRoute = document.getElementById('btn-ar-route');
                if (btnArRoute && newWpInput.value.trim() !== '') {
                    console.log("Waypoint added/updated. Auto-calculating route...");
                    btnArRoute.click(); // Programmatically trigger recalculation
                }
            });
            
            const btnRemove = wpRow.querySelector('.btn-remove-wp');
            btnRemove.addEventListener('click', (e) => {
                e.preventDefault();
                wpRow.remove();
                if (window.waypointManager && window.waypointManager.count > 0) {
                    window.waypointManager.count--;
                }
                
                // Also auto-recalculate when a waypoint is deleted for convenience
                const btnArRoute = document.getElementById('btn-ar-route');
                if (btnArRoute) btnArRoute.click();
            });
        });
    }

    // --- PHASE 8: ACTIVE ROUTE PANEL ROUTING BUTTON (UC7-FR13) ---
    const btnArRoute = document.getElementById('btn-ar-route');
    if (btnArRoute) {
        btnArRoute.addEventListener('click', (e) => {
            e.preventDefault();
            
            const arStartDisplay = document.getElementById('ar-start-display');
            const arEndDisplay = document.getElementById('ar-end-display');
            const origin = arStartDisplay ? arStartDisplay.value.trim() : '';
            const destination = arEndDisplay ? arEndDisplay.value.trim() : '';
            
            // Extract Waypoints
            const waypoints = [];
            const wpInputs = document.querySelectorAll('.waypoint-val');
            wpInputs.forEach(input => {
                const val = input.value.trim();
                if (val) {
                    waypoints.push({
                        location: val,
                        stopover: true
                    });
                }
            });
            
            if (!origin || !destination) return;
            
            btnArRoute.innerHTML = 'Routing...';
            btnArRoute.disabled = true;
            
            const request = {
                origin: origin,
                destination: destination,
                waypoints: waypoints,
                travelMode: 'DRIVING',
                provideRouteAlternatives: true
            };
            
            directionsService.route(request, (result, status) => {
                btnArRoute.innerHTML = 'Route';
                btnArRoute.disabled = false;
                
                if (status === 'OK') {
                    if (result.routes && result.routes.length > 4) {
                        result.routes = result.routes.slice(0, 4);
                    }
                    
                    // --- FORCE ALTERNATE ROUTE HACK ---
                    if (result.routes.length === 1) {
                        let fallbackReq = Object.assign({}, request);
                        fallbackReq.avoidHighways = true;
                        directionsService.route(fallbackReq, (altResult, altStatus) => {
                            if (altStatus === 'OK' && altResult.routes.length > 0) {
                                if (result.routes[0].overview_polyline !== altResult.routes[0].overview_polyline) {
                                    result.routes.push(altResult.routes[0]);
                                }
                            }
                            finalizeRouteRendering(result, origin, destination);
                        });
                        return;
                    }
                    
                    finalizeRouteRendering(result, origin, destination);
                } else {
                    console.error("Directions request failed due to " + status);
                    if (status === 'REQUEST_DENIED') {
                        alert('Route calculation block. API key issue.');
                    } else if (status === 'ZERO_RESULTS' || status === 'NOT_FOUND') {
                        alert('Invalid City/Waypoint');
                    } else {
                        alert('Unable to calculate route: ' + status);
                    }
                }
            });
        });
    }
}

// --- HELPER FUNCTION: RENDER MULTI-LEG ROUTE INFO (UC7-FR14) ---
function renderRouteInfo(result, origin, destination) {
    const route = result.routes[0];
    const estTime = document.getElementById('ar-time-display');
    const estDist = document.getElementById('ar-dist-display');

    let totalMeters = 0;
    let totalSeconds = 0;
    if (route.legs) {
        route.legs.forEach(leg => {
            totalMeters += leg.distance.value;
            totalSeconds += leg.duration.value;
        });
    }

    // Aggregate Time and Distance (FR8, FR9)
    if (estTime && estDist) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        let timeStr = "";
        if (hours > 0) timeStr += `${hours} hr `;
        timeStr += `${minutes} min`;
        estTime.innerText = "(" + timeStr + ")";

        const totalFeet = totalMeters * 3.28084;
        const miles = Math.floor(totalFeet / 5280);
        const feet = Math.round(totalFeet % 5280);
        
        let distStr = "";
        if (miles > 0) distStr += `${miles} mile${miles !== 1 ? 's' : ''}, `;
        distStr += `${feet} ft`;
        estDist.innerText = distStr;
    }

    const form = document.getElementById('routing-form');
    const activeRoutePanel = document.getElementById('active-route-panel');
    const arStartDisplay = document.getElementById('ar-start-display');
    const arEndDisplay = document.getElementById('ar-end-display');
    const userNavAll = document.querySelectorAll('.user-nav');
    const resetPwSectionAll = document.querySelectorAll('.reset-pw-section');
    const favRowAll = document.querySelectorAll('.ar-favorite-row');

    if (form && activeRoutePanel) {
        form.style.display = 'none';
        activeRoutePanel.style.display = 'flex';
        if (arStartDisplay && origin) arStartDisplay.value = origin;
        if (arEndDisplay && destination) arEndDisplay.value = destination;
        
        userNavAll.forEach(el => el.style.display = 'none');
        resetPwSectionAll.forEach(el => el.style.display = 'none');
        favRowAll.forEach(el => el.style.display = 'flex');
    }

    const directionsContainer = document.getElementById('ar-directions-container');
    if (directionsContainer && route.legs) {
        directionsContainer.innerHTML = '';
        
        route.legs.forEach((leg, index) => {
            const startHeader = document.createElement('div');
            startHeader.className = 'dir-city-header';
            
            if (index === 0) {
                startHeader.innerText = 'From: ' + (leg.start_address.split(',')[0] || origin);
            } else {
                // UC7-FR14: Show mileage between waypoints
                startHeader.innerText = 'Waypoint: ' + (leg.start_address.split(',')[0]) + ' (' + leg.distance.text + ' from last)';
            }
            directionsContainer.appendChild(startHeader);
            
            if (leg.steps) {
                leg.steps.forEach(step => {
                    const stepDiv = document.createElement('div');
                    stepDiv.className = 'dir-step';
                    stepDiv.innerHTML = `
                        <span class="dir-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </span>
                        <div class="dir-content">
                            <div class="dir-instruction">${step.instructions}</div>
                            <div class="dir-meta">
                                <span class="dir-time">${step.duration.text}</span>
                                <span class="dir-miles">(${step.distance.text})</span>
                            </div>
                            <div class="dir-divider"></div>
                        </div>
                    `;
                    directionsContainer.appendChild(stepDiv);
                });
            }
            
            if (index === route.legs.length - 1) {
                const destFooter = document.createElement('div');
                destFooter.className = 'dir-city-footer';
                destFooter.innerText = 'Destination: ' + (leg.end_address.split(',')[0] || destination);
                directionsContainer.appendChild(destFooter);
            }
        });
    }
}
