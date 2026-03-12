/**
 * Advanced Route Planner Application Logic
 * Initializes Leaflet map, handles UI interactions and basic simulated routing.
 */

document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const mapContainerId = 'map-view';
    const form = document.getElementById('routing-form');
    const startInput = document.getElementById('start-location');
    const destInput = document.getElementById('end-location');
    const btnRoute = document.getElementById('btn-route');
    const loadingOverlay = document.getElementById('map-loading');
    const routeInfoCard = document.getElementById('route-info');
    
    // Default Map Settings (Ellensburg, WA )
    // Coordinates for Central Washington University area
    const DEFAULT_CENTER = [47.000, -120.538];
    const DEFAULT_ZOOM = 14;
    
    // === Initialize Map ===
    // Creates map instance with disabled UI zoom buttons
    const map = L.map(mapContainerId, {
        zoomControl: false,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        boxZoom: true,
        keyboard: true
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    // Provide a Map tileset layer (CartoDB Positron for a light, clean look)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Variables to hold map layers
    let currentStartMarker = null;
    let currentDestMarker = null;
    let currentRouteLine = null;

    // === Custom Leaflet Icons for a Premium Feel ===
    const createCustomIcon = (color) => {
        return L.divIcon({
            className: 'custom-pin',
            html: `
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="${color}" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="9" r="3" fill="white"/>
                </svg>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location
            popupAnchor: [0, -32] // Point from which the popup should open relative to the iconAnchor
        });
    };

    const iconStart = createCustomIcon('#1e293b'); // Dark Slate
    const iconDest = createCustomIcon('#0099ff');  // Primary Blue

    // === Event Listeners ===
    form.addEventListener('submit', handleRouteSubmission);

    /**
     * Handles the routing form submission to simulate fetching a route
     * @param {Event} e 
     */
    function handleRouteSubmission(e) {
        e.preventDefault(); // Prevent page reload
        
        const startVal = startInput.value.trim();
        const destVal = destInput.value.trim();
        
        if (!startVal || !destVal) {
            alert('Please enter both start and destination locations');
            return;
        }

        // 1. Show Loading State
        toggleLoadingState(true);
        btnRoute.disabled = true;
        btnRoute.innerHTML = '<span class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin: 0;"></span>';

        // 2. Hide route info initially
        routeInfoCard.style.display = 'none';

        // 3. Simulate API Call delay (e.g. Google Maps Directions API fetching)
        setTimeout(() => {
            calculateAndDrawMockRoute(startVal, destVal);
            
            // Revert Button State
            btnRoute.disabled = false;
            btnRoute.innerHTML = `
                <span>Route</span>
                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            `;
            
            // Show route info
            routeInfoCard.style.display = 'flex';
            
            toggleLoadingState(false);
        }, 1500); // 1.5s simulated loading
    }

    /**
     * Toggles the map loading overlay
     * @param {boolean} show 
     */
    function toggleLoadingState(show) {
        if (show) {
            loadingOverlay.classList.add('active');
        } else {
            loadingOverlay.classList.remove('active');
        }
    }

    /**
     * Simulates route calculation by dropping markers at random nearby coordinates
     * and connecting them with a direct line bounds.
     * In a real app, you would use a geocoder and a routing API like OSRM or Mapbox.
     * @param {string} startName 
     * @param {string} destName 
     */
    function calculateAndDrawMockRoute(startName, destName) {
        // Clear previous routes/markers
        if (currentStartMarker) map.removeLayer(currentStartMarker);
        if (currentDestMarker) map.removeLayer(currentDestMarker);
        if (currentRouteLine) map.removeLayer(currentRouteLine);

        // Define mock coordinate spread centered around Ellensburg, WA
        // Center: 47.000, -120.538
        const randomOffset = () => (Math.random() - 0.5) * 0.02; 
        
        const startPos = [DEFAULT_CENTER[0] + randomOffset(), DEFAULT_CENTER[1] + randomOffset()];
        const destPos = [DEFAULT_CENTER[0] + randomOffset(), DEFAULT_CENTER[1] + randomOffset()];

        // 1. Add Markers with Popups
        currentStartMarker = L.marker(startPos, { icon: iconStart })
            .bindPopup(`<b>Start</b><br>${startName}`)
            .addTo(map);
            
        currentDestMarker = L.marker(destPos, { icon: iconDest })
            .bindPopup(`<b>Destination</b><br>${destName}`)
            .addTo(map);

        // 2. Draw a smooth multi-point path to look like a road 
        // In real use, this would be an array of lat/lng returned by the directions API
        
        // Using an artificial 3-point bend for aesthetics instead of a straight line
        const midPoint = [
            (startPos[0] + destPos[0]) / 2 + randomOffset()*0.5, 
            (startPos[1] + destPos[1]) / 2 - randomOffset()*0.5
        ];

        const routeCoords = [startPos, midPoint, destPos];

        // Using modern blue polyline
        currentRouteLine = L.polyline(routeCoords, {
            color: '#0072ff',
            weight: 6,
            opacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round',
            dashArray: '1, 10' // Slight dashed effect for visual flair (optional)
        }).addTo(map);

        // 3. Animate map bounds to neatly fit the entire route
        const group = new L.featureGroup([currentStartMarker, currentDestMarker, currentRouteLine]);
        map.fitBounds(group.getBounds(), {
            padding: [50, 50],
            maxZoom: 16,
            animate: true,
            duration: 1.5 // Smooth animation
        });
        
        // 4. Update the route info card with random numbers for realism
        const distMi = (Math.random() * 3 + 0.5).toFixed(1);
        const timeMin = Math.floor(distMi * 4 + (Math.random() * 5));
        
        document.getElementById('est-dist').innerText = `${distMi} mi`;
        document.getElementById('est-time').innerText = `${timeMin} min`;
    }
    
    // Auto-focus the start input
    setTimeout(() => {
        startInput.focus();
    }, 500);
});
