package com.example.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.model.Stop;
import com.example.backend.model.Stop.StopType;
import com.example.backend.model.Route;
import com.example.backend.service.LocationService;
import com.example.backend.service.RouteService;
import com.google.maps.model.TravelMode;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class RouteController {

    private final LocationService locationService;
    private final RouteService    routeService;

    public RouteController(LocationService locationService, RouteService routeService) {
        this.locationService = locationService;
        this.routeService    = routeService;
    }

    // ── Directions & Geocoding ────────────────────────────────────────────────

    /**
     * POST /api/directions
     * Body: { "start": "...", "end": "...", "mode": "DRIVING" }
     *
     * Returns directions data including the encodedPolyline.
     * The frontend draws the polyline using this, then calls POST /api/routes to save it.
     */
    @PostMapping("/directions")
    public ResponseEntity<?> getDirections(@RequestBody DirectionsRequest req) {
        try {
            TravelMode mode = TravelMode.valueOf(
                    req.mode() != null ? req.mode().toUpperCase() : "DRIVING");
            return ResponseEntity.ok(locationService.getDirections(req.start(), req.end(), mode));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/geocode?address=... */
    @GetMapping("/geocode")
    public ResponseEntity<?> geocode(@RequestParam String address) {
        try {
            return ResponseEntity.ok(locationService.geocode(address));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Routes ────────────────────────────────────────────────────────────────

    /** GET /api/routes?userID=1 */
    @GetMapping("/routes")
    public ResponseEntity<List<Route>> loadRoutes(@RequestParam int userID) {
        return ResponseEntity.ok(routeService.loadRoutes(userID));
    }

    /**
     * POST /api/routes
     * Saves a completed route after the user confirms directions.
     *
     * Body:
     * {
     *   "name": "Home to CWU",
     *   "polyline": "encoded_string_from_directions_response",
     *   "userID": 1,
     *   "stops": [
     *     { "stopType": "ORIGIN",      "placeId": "ChIJ...", "addressString": "...", "latitude": 0.0, "longitude": 0.0 },
     *     { "stopType": "DESTINATION", "placeId": "ChIJ...", "addressString": "...", "latitude": 0.0, "longitude": 0.0 }
     *   ]
     * }
     *
     * Will be rejected by the DB trigger if the user already has 5 routes.
     */
    @PostMapping("/routes")
    public ResponseEntity<?> saveRoute(@RequestBody RouteRequest req) {
        try {
            List<Stop> stops = req.stops().stream()
                    .map(s -> new Stop(
                            StopType.valueOf(s.stopType().toUpperCase()),
                            req.stops().indexOf(s),   // stopSequence = position in list
                            s.placeId(),
                            s.addressString(),
                            s.latitude(),
                            s.longitude()
                    ))
                    .collect(Collectors.toList());

            Route saved = routeService.createRoute(req.name(), req.polyline(), req.userID(), stops);
            return ResponseEntity.ok(Map.of("routeId", saved.getRouteID(), "name", saved.getName()));
        } catch (Exception e) {
            // Catches the DB trigger's 5-route limit error too
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** DELETE /api/routes/{routeID} */
    @DeleteMapping("/routes/{routeID}")
    public ResponseEntity<?> deleteRoute(@PathVariable int routeID) {
        try {
            routeService.deleteRoute(routeID);
            return ResponseEntity.ok(Map.of("deleted", routeID));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** PATCH /api/routes/{routeID}/rename  body: { "name": "..." } */
    @PatchMapping("/routes/{routeID}/rename")
    public ResponseEntity<?> renameRoute(@PathVariable int routeID,
                                          @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(routeService.renameRoute(routeID, body.get("name")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ── Request records ───────────────────────────────────────────────────────

    record DirectionsRequest(String start, String end, String mode) {}

    record RouteRequest(
            String name,
            String polyline,
            int userID,
            List<StopRequest> stops
    ) {}

    record StopRequest(
            String stopType,       // "ORIGIN", "DESTINATION", or "WAYPOINT"
            String placeId,
            String addressString,
            double latitude,
            double longitude
    ) {}
}
