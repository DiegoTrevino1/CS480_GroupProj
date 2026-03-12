package com.example.backend.model;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

/*
 * Route entity — JPA column names match your ERD exactly:
 *   routeId, userId (FK), routeName, polyline
 *
 * Note: isFavorite is NOT in your SQL schema so it's removed here.
 * The 5-route limit is enforced by your DB trigger — no need to duplicate in Java.
 */
@Entity
@Table(name = "routes")
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "routeId")
    private int routeID;

    @Column(name = "routeName", length = 255)
    private String name;

    // Stores the Google Maps encoded polyline string for rendering on the frontend
    @Column(name = "polyline", columnDefinition = "TEXT")
    private String polyline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "userId", nullable = false)
    private User user;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stopSequence ASC")
    private List<Stop> stops = new ArrayList<>();

    // Required by JPA
    protected Route() {}

    public Route(String name, User user) {
        this.name = name;
        this.user = user;
    }

    public Route(String name, String polyline, User user) {
        this.name     = name;
        this.polyline = polyline;
        this.user     = user;
    }

    // ── Class-diagram methods ────────────────────────────────────────────────

    public void addStop(Stop stop) {
        stop.setStopSequence(stops.size());
        stop.setRoute(this);
        stops.add(stop);
    }

    public void removeStop(Stop stop) {
        stops.remove(stop);
        stop.setRoute(null);
        for (int i = 0; i < stops.size(); i++) {
            stops.get(i).setStopSequence(i);
        }
    }

    public void renameRoute(String name) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Route name cannot be blank.");
        this.name = name.trim();
    }

    public List<Stop> getOrderedStops() {
        return stops.stream()
                .sorted(Comparator.comparingInt(Stop::getStopSequence))
                .toList();
    }

    // ── Getters / Setters ────────────────────────────────────────────────────

    public int    getRouteID()  { return routeID;  }
    public String getName()     { return name;     }
    public String getPolyline() { return polyline; }
    public User   getUser()     { return user;     }
    public List<Stop> getStops() { return stops;  }

    public void setName(String name)         { this.name = name;         }
    public void setPolyline(String polyline) { this.polyline = polyline; }
}
