# Trinity — Route Planner

A full-stack navigation web app built as a team capstone project for CS480 (Advanced Software Engineering), applying the full Software Development Life Cycle — requirements gathering, use-case driven design, iterative implementation, and stakeholder feedback — to ship a working product from scratch.

Trinity lets a user create an account, plan driving routes between two (or more) locations on an interactive map, view turn-by-turn directions with time/distance estimates, and save frequently used routes as favorites for quick access later.

## Features

- **Route planning** — enter a start and destination and get a driving route rendered on an interactive map via the Google Maps API.
- **Alternate routes & waypoints** — compare alternate paths and add up to 5 intermediate stops, with routes and directions recalculating automatically.
- **Turn-by-turn directions** — step-by-step instructions with per-leg distance/duration and aggregate trip time and distance.
- **Saved routes** — save, rename, load, and delete favorite routes (capped at 5 per user), backed by a real database — not just local storage.
- **Account flow** — sign up, sign in, sign out, and password reset, backed by a REST API and hashed password storage.
- **Geolocation** — centers the map on the user's current location when permission is granted.

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Backend    | Java 21, Spring Boot 4.0.3, Spring Web (REST), Spring Data JPA |
| Database   | MySQL, with a schema-level trigger enforcing the 5-route-per-user limit |
| Frontend   | HTML5, CSS3, vanilla JavaScript |
| Mapping    | Google Maps Java Client (server-side directions/geocoding) + Google Maps JavaScript API (client-side rendering) |
| Auth       | Salted SHA-256 password hashing |
| Build      | Maven |

## Architecture

The backend is a layered Spring Boot REST API sitting in front of a normalized MySQL schema:

```
demo/src/main/java/com/example/backend/
├── TrinityApplication.java        # Spring Boot entry point
├── controller/
│   ├── AuthController.java        # /api/auth — login, signup, logout, password reset
│   └── RouteController.java       # /api — directions, geocoding, route CRUD
├── service/
│   ├── LoginManager.java          # auth business logic
│   ├── LocationService.java       # wraps the Google Maps Java client (directions, geocoding)
│   └── RouteService.java          # route creation/rename/delete, backed by JPA
├── repository/                    # Spring Data JPA repositories (User, Route, Stop)
├── model/                         # User, Route, Stop JPA entities
└── db/DatabaseManager.java        # JDBC user persistence + password hashing
```

```
demo/src/main/resources/static/route-app/
├── html/    # signUp, signIn, mainPage, resetPassword, ...
├── css/     # per-page stylesheets
└── JS/      # mapLogic.js (routing/waypoints), favoriteManager.js (saved routes),
             # signIn.js / signUp.js (auth forms), signOut.js, resetPassword*.js
```

**Data model:** a `User` has many `Route`s; each `Route` has an ordered list of `Stop`s (`ORIGIN`, `WAYPOINT`, or `DESTINATION`) plus a saved Google Maps encoded polyline for fast re-rendering. A MySQL trigger (`limit_user_routes`, see [`Trinity Database Build Script.sql`](Trinity%20Database%20Build%20Script.sql)) rejects inserts once a user already has 5 saved routes, so the business rule is enforced at the database level, not just in the UI.

**API surface:**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Authenticate and start a session |
| POST | `/api/auth/logout` | End the session |
| POST | `/api/auth/reset-password` | Reset a password |
| POST | `/api/directions` | Get driving directions + encoded polyline between two points |
| GET | `/api/geocode` | Geocode an address to lat/lng |
| GET | `/api/routes?userID=` | List a user's saved routes |
| POST | `/api/routes` | Save a route with its stops |
| DELETE | `/api/routes/{routeID}` | Delete a saved route |
| PATCH | `/api/routes/{routeID}/rename` | Rename a saved route |

## Getting Started

### Prerequisites

- Java 21+
- Maven (or use the included `mvnw` wrapper)
- A MySQL instance
- A [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) with the Directions, Geocoding, and Places APIs enabled

### Setup

1. Clone the repo and open the `demo/` directory.
2. Create the database by running [`Trinity Database Build Script.sql`](Trinity%20Database%20Build%20Script.sql) against your MySQL instance — it creates the `trinity` database, tables, and the route-limit trigger.
3. Configure [`application.properties`](demo/src/main/resources/application.properties) with your MySQL credentials and Google Maps API key.
4. Set your Google Maps API key in [`mainPage.html`](demo/src/main/resources/static/route-app/html/mainPage.html) for client-side map rendering.
5. Run the app:

   ```bash
   cd demo
   ./mvnw spring-boot:run       # macOS/Linux
   mvnw.cmd spring-boot:run     # Windows
   ```

6. Open `src/main/resources/static/route-app/html/signIn.html` in a browser, or hit the API directly at `http://localhost:8080/api/...`.

### Running Tests

```bash
cd demo
./mvnw test
```

## Team

Built by a 5-person team for CS480: [DiegoTrevino1](https://github.com/DiegoTrevino1), [Caden-web](https://github.com/Caden-web), [GLeon-12](https://github.com/GLeon-12), [kjalleyne](https://github.com/kjalleyne), and [jacobhasason](https://github.com/jacobhasason).
