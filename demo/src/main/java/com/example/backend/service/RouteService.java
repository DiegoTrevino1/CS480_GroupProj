package com.example.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.model.Route;
import com.example.backend.model.Stop;
import com.example.backend.model.User;
import com.example.backend.repository.RouteRepository;
import com.example.backend.repository.UserRepository;

@Service
@Transactional
public class RouteService {

    private final RouteRepository routeRepository;
    private final UserRepository  userRepository;

    public RouteService(RouteRepository routeRepository, UserRepository userRepository) {
        this.routeRepository = routeRepository;
        this.userRepository  = userRepository;
    }

    /** +loadRoutes(userID) */
    @Transactional(readOnly = true)
    public List<Route> loadRoutes(int userID) {
        return routeRepository.findByUser_UserID(userID);
    }

    /** +deleteRoute(routeID) */
    public void deleteRoute(int routeID) {
        if (!routeRepository.existsById(routeID))
            throw new RuntimeException("Route not found: " + routeID);
        routeRepository.deleteById(routeID);
    }

    /** +saveRoute(route) */
    public Route saveRoute(Route route) {
        return routeRepository.save(route);
    }

    /**
     * Creates a new route with its polyline and stops in one call.
     * The DB trigger will reject this if the user already has 5 routes.
     *
     * @param name       route display name
     * @param polyline   Google Maps encoded polyline string
     * @param userID     owner
     * @param stops      list of stops to attach (ORIGIN, WAYPOINTs, DESTINATION)
     */
    public Route createRoute(String name, String polyline, int userID, List<Stop> stops) {
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new RuntimeException("User not found: " + userID));

        Route route = new Route(name, polyline, user);
        for (Stop stop : stops) {
            route.addStop(stop);
        }
        // DB trigger fires here — throws if user already has 5 routes
        return routeRepository.save(route);
    }

    /** Rename a route */
    public Route renameRoute(int routeID, String newName) {
        Route route = routeRepository.findById(routeID)
                .orElseThrow(() -> new RuntimeException("Route not found: " + routeID));
        route.renameRoute(newName);
        return routeRepository.save(route);
    }
}
