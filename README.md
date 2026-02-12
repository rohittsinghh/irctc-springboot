# IRCTC Demo — Train Booking Example

A compact demo of a train booking flow using a small Spring Boot backend and static frontend assets. Intended for learning and prototyping only — not a production booking system.

## Features
- Simple Spring Boot REST API for trains and bookings
- Static frontend (HTML/CSS/vanilla JS) served from `src/main/resources/static`
- Local JSON data for trains and stations
- Optimistic UI for cancellations with undo

## Prerequisites
- Java 17 or later
- Maven 3.6+
- Docker (for container builds)

## Run locally
1. Build the project:

```bash
mvn -DskipTests package
```

2. Run the JAR:

```bash
java -jar target/*.jar
# then open http://localhost:8080
```

Or run with Maven:

```bash
mvn spring-boot:run
```

## Docker
Build and run the provided Docker image:

```bash
docker build -t irctc-demo .
docker run -p 8080:8080 irctc-demo
# open http://localhost:8080
```

The container listens on port `8080`. Platforms like Fly.io or Render set a `PORT` env var — the application reads `server.port` from `PORT` (`src/main/resources/application.properties`).

## CI / Publishing
A GitHub Actions workflow `.github/workflows/ci-cd.yml` is included to build the jar and publish a Docker image to GitHub Container Registry (GHCR) on pushes to `main`.

Notes:
- After pushing to GitHub the workflow will build and push images to `ghcr.io/<your-account>/irctc-demo`.
- To deploy automatically to Fly.io or Render, add the provider deploy step and set required secrets (e.g. `FLY_API_TOKEN`).

## Deployment (recommended simple option)
1. Push the repo to GitHub.
2. Use Fly.io for a minimal JVM host (install `flyctl`). Example:

```bash
fly launch   # choose Dockerfile, set app name/region
fly deploy
```

Alternatively, use Render or Railway and connect the GitHub repo.

## Data
- Server-side trains are persisted in `data/trains.json` (project root) and loaded by `TrainService`.
- Frontend includes static `src/main/resources/static/data` used for demos.

## Notes & Safety
- This project is for learning/demo only — do not use the provided data or flows in production.
- If you plan to enable persistent storage or real ticketing, add authentication, secure endpoints, and a proper database.

## License
This repository contains demo/sample code. Add a license file if you plan to publish or reuse code commercially.