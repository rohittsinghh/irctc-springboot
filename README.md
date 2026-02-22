# IRCTC Spring Boot - Train Booking System

Simple full-stack train booking demo built with Spring Boot (Java 17) and vanilla JavaScript.
The backend serves both REST APIs and static UI, and persists runtime data in local JSON files.

> This project is intentionally lightweight and educational. It is not production-ready as-is.

## Tech Stack

- Java 17
- Spring Boot 3.2.2 (`spring-boot-starter-web`)
- Jackson for JSON file serialization/deserialization
- Vanilla JavaScript + HTML/CSS (no frontend build step)
- Docker (multi-stage build)

## Implemented Features

### Authentication
- Signup and login via `/api/auth/*`
- Frontend stores session in `sessionStorage` (`irctc_sess`) via `window.Auth`
- Auth guard redirects unauthenticated users from dashboard/bookings to login

### Train discovery
- List all trains (`GET /api/trains`)
- Search by source and destination (`GET /api/trains/search?source=...&destination=...`)
- Dashboard supports station/code-aware autocomplete using local station dataset

### Booking lifecycle
- Book ticket with `userId` + `trainId` (`POST /api/bookings`)
- Fetch user tickets (`GET /api/bookings/{userId}`)
- Cancel ticket with ownership check (`DELETE /api/bookings/{ticketId}?userId=...`)
- Seat count decreases on booking and is restored on cancellation

### UX features
- Toast notifications (`window.UI.toast` / `toastAction`)
- Optimistic cancellation with Undo window before server delete
- Inline seat availability updates in search results after successful booking
- Shared nav and route-aware active state

## Architecture Overview

### Backend
- Entry point: `src/main/java/com/irctc/IrctcApplication.java`
- Controllers:
   - `AuthController` (`/api/auth`)
   - `TrainController` (`/api/trains`)
   - `BookingController` (`/api/bookings`)
   - `HealthController` (`/api/health`)
- Services:
   - `TrainService` manages train catalog + seat counters
   - `UserBookingService` manages users + ticket lists

### Data persistence model
- Runtime files: `data/trains.json`, `data/users.json`
- Services load files once at startup into in-memory lists
- Mutations rewrite the whole JSON file using Jackson pretty printing
- If files are changed externally while app is running, restart is required to reload

### Frontend
- Pages:
   - `index.html` (login)
   - `signup.html` (signup)
   - `dashboard.html` (search + booking)
   - `bookings.html` (ticket history + cancel)
- Global modules (plain script tags, no bundler):
   - `window.API` (`static/js/api.js`)
   - `window.Auth` (`static/js/auth.js`)
   - `window.UI` (`static/js/ui.js`)
   - `window.Stations` (`static/js/stations.js`)

## API Reference

Base URL: `/api`

### Auth
- `POST /auth/signup`
   - Body: `{ "name": "alice", "password": "secret" }`
   - Success: `{ "status": "signup_success" }`
- `POST /auth/login`
   - Body: `{ "name": "alice", "password": "secret" }`
   - Success: `{ "status": "login_success", "userId": "..." }`

### Trains
- `GET /trains`
   - Response: `{ "trains": [Train] }`
- `GET /trains/{id}`
   - Response: `Train` or `null`
- `GET /trains/search?source=delhi&destination=mumbai`
   - Response: `{ "trains": [Train] }`

### Bookings
- `POST /bookings`
   - Body: `{ "userId": "...", "trainId": "..." }`
   - Success: `Ticket`
- `GET /bookings/{userId}`
   - Success: `{ "tickets": [Ticket] }`
- `DELETE /bookings/{ticketId}?userId=...`
   - Success: `{ "status": "cancelled" }`

### Health
- `GET /health`
   - Success: `{ "status": "ok" }`

### Common error payload
- Endpoints return simple map-style errors, e.g. `{ "error": "invalid_credentials" }`, `{ "error": "no_seats_available" }`.

## Data Schemas

### Train
```json
{
   "trainId": "T101",
   "trainName": "Rajdhani Express",
   "source": "delhi",
   "destination": "mumbai",
   "totalSeats": 100,
   "availableSeats": 98
}
```

### User
```json
{
   "userId": "uuid",
   "name": "alice",
   "password": "plaintext",
   "ticketsBooked": []
}
```

### Ticket
```json
{
   "ticketId": "uuid",
   "userId": "uuid",
   "source": "delhi",
   "destination": "mumbai",
   "journeyDate": "2026-02-22",
   "train": { "trainId": "T101", "trainName": "Rajdhani Express" }
}
```

## Run Locally

### Prerequisites
- JDK 17+
- Maven 3.6+

### Commands
```bash
# from repository root
mvn clean package
mvn spring-boot:run
```

Open: `http://localhost:8080`

Alternative run:
```bash
java -jar target/irctc-0.0.1-SNAPSHOT.jar
```

## Docker

Build image:
```bash
docker build -t irctc-app .
```

Run with persistent runtime data:
```bash
docker run -p 8080:8080 -v "$(pwd)/data:/app/data" irctc-app
```

Notes:
- Dockerfile uses multi-stage Temurin 17 images.
- Runtime reads/writes `/app/data/*.json`.

## Useful Paths

- Backend Java source: `src/main/java/com/irctc`
- Frontend pages/assets: `src/main/resources/static`
- Canonical frontend scripts: `src/main/resources/static/js`
- Canonical frontend stylesheet: `src/main/resources/static/css/app.css`
- Runtime JSON data: `data/`

## Known Limitations

- No database (JSON files only)
- No password hashing (plain text stored in `data/users.json`)
- No Spring Security/JWT
- Minimal backend validation and no formal exception handling layer
- No automated tests are present in this repository currently

## Manual Feature Verification

1. Open `/signup.html`, create a user
2. Login from `/index.html`
3. Search trains on `/dashboard.html`
4. Book any train with available seats
5. Open `/bookings.html` and verify ticket appears
6. Cancel ticket and verify seat is restored

## License

No license file is currently included in the repository.