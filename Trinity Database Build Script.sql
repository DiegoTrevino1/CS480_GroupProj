DROP DATABASE IF EXISTS trinity;
CREATE DATABASE trinity
	CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
;
USE trinity;


CREATE TABLE users (
    userId			INT 				AUTO_INCREMENT		PRIMARY KEY,
    username		VARCHAR(50)			NOT NULL			UNIQUE,
    password		VARCHAR(255)		NOT NULL
);

-- Main Route Header
CREATE TABLE routes (
    routeId			INT					AUTO_INCREMENT		PRIMARY KEY,
    userId			INT					NOT NULL,
    routeName 		VARCHAR(255),
    polyline		TEXT,
    CONSTRAINT 		routes_fk_users
		FOREIGN KEY (userId)
		REFERENCES users(userId)
        ON DELETE CASCADE
);

-- Unified Table for all Route Points (Scalable & Normalized)
CREATE TABLE stops (
    stopId 			INT					AUTO_INCREMENT			PRIMARY KEY,
    routeId			INT 				NOT NULL,
    
    -- Role: 'ORIGIN', 'DESTINATION', or 'WAYPOINT'
    stopType		ENUM('ORIGIN', 'DESTINATION', 'WAYPOINT')	NOT NULL,
    stopSequence	INT 				NOT NULL,
    
    -- Google Maps Data
    placeId			VARCHAR(255)		NOT NULL,
    addressString	VARCHAR(255),
    latitude		DECIMAL(10, 8),
    longitude		DECIMAL(11, 8),

    CONSTRAINT		stops_fk_routes
		FOREIGN KEY (routeId)
        REFERENCES	routes(routeId)
        ON DELETE CASCADE
);

CREATE INDEX idx_route_stop ON stops (
	routeId,
    stopSequence
);

-- 4. Trigger: Enforce Max 5 Routes Per User
DELIMITER //
CREATE TRIGGER limit_user_routes
BEFORE INSERT ON routes
FOR EACH ROW
BEGIN
    DECLARE routeCount INT;
    
    SELECT COUNT(*)
    INTO routeCount
    FROM routes
    WHERE userId = NEW.userId;
    
    IF routeCount >= 5 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'User has reached the maximum limit of 5 saved routes.';
    END IF;
END;
//
DELIMITER ;
