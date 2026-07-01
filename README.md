# Trinity — Route Planner

A full-stack navigation web app built as a team capstone project for CS480 (Software Engineering), applying the full Software Development Life Cycle — requirements gathering, use-case driven design, iterative implementation, and stakeholder feedback — to ship a working product from scratch.

Trinity lets a user create an account, plan driving routes between two (or more) locations on an interactive map, view turn-by-turn directions with time/distance estimates, and save frequently used routes as favorites for quick access later.

## Features

- **Route planning** — enter a start and destination, and get a driving route rendered on an interactive map via the Google Maps JavaScript API.
- **Alternate routes** — up to 3 alternate paths are calculated and drawn alongside the primary route so the user can compare options.
- **Waypoints** — add up to 5 intermediate stops to a route; the route and directions recalculate automatically as stops are added or removed.
- **Turn-by-turn directions** — step-by-step instructions with per-leg distance and duration, plus aggregate trip time/distance.
- **Favorites** — save, rename, load, and delete favorite routes (max 5), with confirmation modals and inline success/error feedback.
- **Account flow** — sign up with password-complexity validation, sign in, sign out (with confirmation), and password reset screens.
- **Geolocation** — centers the map on the user's current location when permission is granted.

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Backend    | Java 17, Spring Boot 4.0.3, Maven |
| Database   | MySQL (via JDBC) |
| Frontend   | HTML5, CSS3, vanilla JavaScript |
| Mapping    | Google Maps JavaScript API (Directions, Places) |
| Auth       | Salted SHA-256 password hashing |

## Project Structure

```
demo/
├── src/main/java/com/example/backend/
│   ├── TrinityApplication.java   # Spring Boot entry point
│   ├── model/User.java           # User model with salted SHA-256 password hashing
│   ├── db/DatabaseManager.java   # JDBC connection + CRUD for the users table
│   └── service/LoginManager.java # Login/registration business logic
└── src/main/resources/static/route-app/
    ├── html/                     # signUp, signIn, mainPage, resetPassword, ...
    ├── css/                      # per-page stylesheets
    └── JS/
        ├── mapLogic.js           # routing, waypoints, alternate routes, directions
        ├── favoriteManager.js    # save/load/rename/delete favorite routes
        ├── signIn.js / signUp.js # auth forms + client-side validation
        └── signOut.js / resetPassword*.js
```

## Getting Started

### Prerequisites

- Java 17+
- Maven (or use the included `mvnw` wrapper)
- A MySQL instance
- A [Google Maps JavaScript API key](https://developers.google.com/maps/documentation/javascript/get-api-key) with the Directions and Places APIs enabled

### Setup

1. Clone the repo and open the `demo/` directory.
2. Configure the database connection in [`DatabaseManager.java`](demo/src/main/java/com/example/backend/db/DatabaseManager.java) (`dburl`, `dbUserName`, `dbPassword`) and create a `users` table matching the columns used in that file (`userID`, `userName`, `userPasswordHash`).
3. Set your Google Maps API key in [`mainPage.html`](demo/src/main/resources/static/route-app/html/mainPage.html) (script tag at the bottom of the file).
4. Run the app:

   ```bash
   cd demo
   ./mvnw spring-boot:run       # macOS/Linux
   mvnw.cmd spring-boot:run     # Windows
   ```

5. Open `src/main/resources/static/route-app/html/signIn.html` in a browser to try the UI.

### Running Tests

```bash
cd demo
./mvnw test
```

## Current Status

This project was built in phases (UI first, then backend wiring), so a few pieces are still mocked rather than fully connected end-to-end:

- The sign-in/sign-up forms currently validate against mock credentials in the browser; wiring them to `LoginManager`/`DatabaseManager` over a REST endpoint is the next integration step.
- Favorite routes are persisted in `localStorage` rather than the database.
- Database credentials in `DatabaseManager.java` are placeholders meant to be swapped for environment-specific config (e.g. environment variables) before any real deployment.

## Team

Built by a 5-person team for CS480: [DiegoTrevino1](https://github.com/DiegoTrevino1), [Caden-web](https://github.com/Caden-web), [GLeon-12](https://github.com/GLeon-12), [kjalleyne](https://github.com/kjalleyne), and [jacobhasason](https://github.com/jacobhasason).
