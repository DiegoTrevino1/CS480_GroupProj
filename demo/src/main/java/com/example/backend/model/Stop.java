package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/*
 * Stop entity — JPA column names match your ERD exactly:
 *   stopId, routeId (FK), stopType, stopSequence,
 *   placeId, addressString, latitude, longitude
 */
@Entity
@Table(name = "stops")
public class Stop {

    // ── ENUM matching your SQL: ENUM('ORIGIN', 'DESTINATION', 'WAYPOINT') ────
    public enum StopType {
        ORIGIN, DESTINATION, WAYPOINT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stopId")
    private int stopID;

    @Enumerated(EnumType.STRING)
    @Column(name = "stopType", nullable = false)
    private StopType stopType;

    @Column(name = "stopSequence", nullable = false)
    private int stopSequence;

    // Google Maps place ID (e.g. "ChIJ...")
    @Column(name = "placeId", nullable = false, length = 255)
    private String placeId;

    @Column(name = "addressString", length = 255)
    private String addressString;

    // DECIMAL(10,8) and DECIMAL(11,8) match your SQL exactly
    @Column(name = "latitude")
    private double latitude;

    @Column(name = "longitude")
    private double longitude;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routeId", nullable = false)
    private Route route;

    // Required by JPA
    protected Stop() {}

    // Constructor for creating a stop from a Google Maps geocode result
    public Stop(StopType stopType, int stopSequence, String placeId,
                String addressString, double latitude, double longitude) {
        this.stopType      = stopType;
        this.stopSequence  = stopSequence;
        this.placeId       = placeId;
        this.addressString = addressString;
        this.latitude      = latitude;
        this.longitude     = longitude;
    }

    // ── +getCoordinates() from class diagram ─────────────────────────────────
    public CoordinatesDTO getCoordinates() {
        return new CoordinatesDTO(latitude, longitude);
    }

    public record CoordinatesDTO(double lat, double lng) {}

    // ── Getters / Setters ────────────────────────────────────────────────────

    public int      getStopID()       { return stopID;       }
    public StopType getStopType()     { return stopType;     }
    public int      getStopSequence() { return stopSequence; }
    public String   getPlaceId()      { return placeId;      }
    public String   getAddressString(){ return addressString;}
    public double   getLatitude()     { return latitude;     }
    public double   getLongitude()    { return longitude;    }
    public Route    getRoute()        { return route;        }

    public void setRoute(Route route)           { this.route = route;               }
    public void setStopSequence(int seq)        { this.stopSequence = seq;          }
    public void setStopType(StopType stopType)  { this.stopType = stopType;         }
}
