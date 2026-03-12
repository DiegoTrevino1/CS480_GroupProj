package com.example.backend.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.google.maps.DirectionsApi;
import com.google.maps.GeoApiContext;
import com.google.maps.GeocodingApi;
import com.google.maps.model.DirectionsLeg;
import com.google.maps.model.DirectionsResult;
import com.google.maps.model.DirectionsRoute;
import com.google.maps.model.GeocodingResult;
import com.google.maps.model.LatLng;
import com.google.maps.model.TravelMode;
import com.google.maps.model.Unit;

import jakarta.annotation.PreDestroy;

/**
 * LocationService — matches class diagram:
 *   -apiKey: String
 *   +getDirections(start, end)
 *   +geocode(address)
 *
 * Uses the Google Maps Java Client library (google-maps-services 2.2.0).
 * Enable these in Google Cloud Console:
 *   - Geocoding API
 *   - Directions API
 */
@Service
public class LocationService {

    private final GeoApiContext context;

    public LocationService(@Value("${google.maps.api-key}") String apiKey) {
        this.context = new GeoApiContext.Builder()
                .apiKey(apiKey)
                .build();
    }

    // ── geocode ───────────────────────────────────────────────────────────────

    /**
     * +geocode(address)
     * Converts a human-readable address to lat/lng.
     */
    public GeocodeDTO geocode(String address) throws Exception {
        GeocodingResult[] results = GeocodingApi.geocode(context, address).await();

        if (results == null || results.length == 0) {
            throw new RuntimeException("No geocoding results for: " + address);
        }

        LatLng loc = results[0].geometry.location;
        return new GeocodeDTO(loc.lat, loc.lng, results[0].formattedAddress);
    }

    // ── getDirections ─────────────────────────────────────────────────────────

    /**
     * +getDirections(start, end)
     * Returns distance, duration, encoded polyline, and turn-by-turn steps.
     *
     * @param start address string or "lat,lng"
     * @param end   address string or "lat,lng"
     * @param mode  DRIVING | WALKING | BICYCLING | TRANSIT
     */
    public DirectionsDTO getDirections(String start, String end, TravelMode mode) throws Exception {
        DirectionsResult raw = DirectionsApi.getDirections(context, start, end)
                .mode(mode)
                .units(Unit.IMPERIAL)
                .alternatives(false)
                .await();

        if (raw.routes == null || raw.routes.length == 0) {
            throw new RuntimeException("No route found between: " + start + " and " + end);
        }

        DirectionsRoute route = raw.routes[0];
        DirectionsLeg   leg   = route.legs[0];

        List<StepDTO> steps = Arrays.stream(leg.steps)
                .map(s -> new StepDTO(
                        s.htmlInstructions,
                        s.distance != null ? s.distance.humanReadable : "",
                        s.duration != null ? s.duration.humanReadable : ""
                ))
                .toList();

        return new DirectionsDTO(
                leg.startAddress,
                leg.endAddress,
                leg.distance != null ? leg.distance.humanReadable : "",
                leg.distance != null ? leg.distance.inMeters      : 0,
                leg.duration != null ? leg.duration.humanReadable : "",
                leg.duration != null ? leg.duration.inSeconds     : 0,
                route.overviewPolyline.getEncodedPath(),
                steps
        );
    }

    /** Convenience overload — defaults to DRIVING */
    public DirectionsDTO getDirections(String start, String end) throws Exception {
        return getDirections(start, end, TravelMode.DRIVING);
    }

    @PreDestroy
    public void shutdown() {
        context.shutdown();
    }

    // ── Response DTOs ─────────────────────────────────────────────────────────

    public record GeocodeDTO(
            double lat,
            double lng,
            String formattedAddress
    ) {}

    public record DirectionsDTO(
            String startAddress,
            String endAddress,
            String distanceText,
            long   distanceMeters,
            String durationText,
            long   durationSeconds,
            String encodedPolyline,
            List<StepDTO> steps
    ) {}

    public record StepDTO(
            String instructions,
            String distance,
            String duration
    ) {}
}
