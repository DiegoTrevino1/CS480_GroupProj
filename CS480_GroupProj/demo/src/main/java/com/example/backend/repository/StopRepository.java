package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Stop;

@Repository
public interface StopRepository extends JpaRepository<Stop, Integer> {
    List<Stop> findByRoute_RouteIDOrderByStopSequenceAsc(int routeID);
}