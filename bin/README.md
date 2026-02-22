# IRCTC Spring Boot - Train Booking System

A full-stack train booking application built with Spring Boot 3.4.1 and vanilla JavaScript. Features file-based JSON persistence, real-time seat availability management, and a responsive single-page frontend.

> **Note**: This is a demonstration project for learning purposes. Not recommended for production use without proper authentication, database integration, and security hardening.

## 🚀 Features

### Backend (Spring Boot)
- RESTful API for train search, booking, and user management
- File-based JSON persistence with thread-safe operations
- Real-time seat availability tracking across multiple classes (Sleeper, 3AC, 2AC, 1AC)
- Synchronized booking operations to prevent race conditions
- CORS-enabled for frontend integration

### Frontend (Vanilla JavaScript)
- Single-page application with multiple views (Login, Signup, Dashboard, Bookings)
- Station autocomplete with fuzzy search
- Real-time booking status updates
- Optimistic UI with undo functionality for cancellations
- Toast notifications for user feedback
- Responsive design with modern CSS

### Core Functionality
- User registration and authentication (session-based)
- Train search by source/destination and date
- Booking history and management
- Ticket cancellation with seat restoration

## 📋 Prerequisites

- **Java 17** or later (JDK)
- **Maven 3.6+** for building
- **Docker** (optional, for containerized deployment)

## 🛠️ Quick Start

### Local Development

1. **Clone and navigate to the project**:
   ```bash
   cd irctc-springboot-clean
   ```

2. **Build the project**:
   ```bash
   mvn clean install
   ```

3. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```
   
   Or run the packaged JAR:
   ```bash
   java -jar target/irctc-0.0.1-SNAPSHOT.jar
   ```

4. **Access the application**:
   Open your browser to [http://localhost:8080](http://localhost:8080)

### Docker Deployment

1. **Build the Docker image**:
   ```bash
   docker build -t irctc-app .
   ```

2. **Run the container** (with persistent data):
   ```bash
   docker run -p 8080:8080 -v $(pwd)/data:/app/data irctc-app
   ```
   
   **Important**: Mount the `data/` volume to persist bookings and user data across container restarts.

3. **Access the application**:
   Open [http://localhost:8080](http://localhost:8080)

## 📁 Project Structure

```
irctc-springboot-clean/
├── src/
│   └── main/
│       ├── java/com/irctc/
│       │   ├── IrctcApplication.java       # Spring Boot entry point
│       │   ├── WebConfig.java              # CORS & static resource config
│       │   ├── HealthController.java       # Health check endpoint
│       │   ├── controller/
│       │   │   ├── AuthController.java     # Login/signup endpoints
│       │   │   ├── BookingController.java  # Booking management
│       │   │   └── TrainController.java    # Train search endpoints
│       │   ├── model/
│       │   │   ├── User.java               # User entity
│       │   │   ├── Ticket.java             # Ticket entity
│       │   │   └── Train.java              # Train entity
│       │   └── service/
│       │       ├── TrainService.java       # Train & booking logic
│       │       └── UserBookingService.java # User management
│       └── resources/
│           ├── application.properties      # App configuration
│           ├── localDb/                    # Default data templates
│           │   ├── trains.json
│           │   └── users.json
│           └── static/                     # Frontend assets
│               ├── index.html              # Login page
│               ├── signup.html             # Signup page
│               ├── dashboard.html          # Train search & booking
│               ├── bookings.html           # User bookings view
│               ├── css/app.css             # Styles
│               ├── js/
│               │   ├── api.js              # API wrapper (window.API)
│               │   ├── auth.js             # Auth utils (window.Auth)
│               │   ├── ui.js               # UI helpers (window.UI)
│               │   ├── stations.js         # Station data loader
│               │   ├── login.js            # Login page logic
│               │   ├── signup.js           # Signup page logic
│               │   ├── dashboard.js        # Dashboard logic
│               │   └── bookings.js         # Bookings page logic
│               └── data/
│                   ├── stations.json       # Station list for autocomplete
│                   └── trains.json         # Demo train data
├── data/                                   # Runtime data files (created on first run)
│   ├── trains.json                         # Live train & seat data
│   └── users.json                          # Live user & booking data
├── pom.xml                                 # Maven dependencies
├── Dockerfile                              # Container build config
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Trains
- `GET /api/trains/search?source={source}&destination={dest}&date={date}` - Search trains
- `GET /api/trains` - List all trains

### Bookings
- `POST /api/bookings/book` - Create booking (body: `{username, trainId, seatClass, dateOfJourney}`)
- `GET /api/bookings?username={username}` - Get user bookings
- `DELETE /api/bookings/{ticketId}?username={username}` - Cancel booking

### Health
- `GET /health` - Health check endpoint

## 🗄️ Data Persistence

The application uses **file-based JSON storage** for simplicity:

- **`data/trains.json`**: Stores train information and real-time seat availability
- **`data/users.json`**: Stores user accounts and booking history

### Data Format Examples

**Train Entry**:
```json
{
  "trainId": "T1001",
  "trainName": "Rajdhani Express",
  "source": "Delhi",
  "destination": "Mumbai",
  "availableSeats": {
    "Sleeper": 100,
    "3AC": 50,
    "2AC": 30,
    "1AC": 20
  }
}
```

**User Entry**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "bookings": [
    {
      "ticketId": "TKT-1234567890",
      "trainId": "T1001",
      "trainName": "Rajdhani Express",
      "seatClass": "3AC",
      "dateOfJourney": "2024-03-15",
      "bookingDate": "2024-02-20"
    }
  ]
}
```

### Thread Safety
- All write operations use `synchronized` methods to prevent concurrent modification issues
- Entire JSON files are rewritten atomically on each update

## 🎨 Frontend Architecture

The frontend is a **vanilla JavaScript SPA** with no build step required.

### Global Modules
- **`window.API`**: Centralized API client for backend communication
- **`window.Auth`**: Session management and authentication state
- **`window.UI`**: Reusable UI components (toast notifications, autocomplete)
- **`window.Stations`**: Station data loader and search

### Page Flow
1. **Login** (`index.html`) → Validates credentials → Stores username in `sessionStorage`
2. **Dashboard** (`dashboard.html`) → Search trains → Book seats
3. **Bookings** (`bookings.html`) → View history → Cancel tickets

### Key Frontend Features
- Station autocomplete with fuzzy matching
- Toast notifications (success/error/info)
- Optimistic UI updates with rollback on failure
- Session-based authentication (username stored in `sessionStorage`)

## 🔧 Configuration

### Application Properties
Located in `src/main/resources/application.properties`:

```properties
server.port=${PORT:8080}
spring.web.resources.static-locations=classpath:/static/
```

### CORS Configuration
Configured in `WebConfig.java` to allow all origins (development only):
```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
            .allowedOrigins("*")
            .allowedMethods("*")
            .allowedHeaders("*");
}
```

## 🧪 Testing

Run unit tests:
```bash
mvn test
```

Manual testing checklist:
1. Register a new user via signup page
2. Login with created credentials
3. Search for trains by source/destination
4. Book a seat in available class
5. View bookings and cancel a ticket
6. Verify seat count restored after cancellation

## 🚢 Deployment

### Cloud Platforms

**Fly.io** (recommended for quick deployment):
```bash
fly launch
fly deploy
```

**Render** or **Railway**:
1. Connect your GitHub repository
2. Select "Dockerfile" as build method
3. Set port to `8080`
4. Deploy

**Heroku**:
```bash
heroku create your-app-name
heroku container:push web
heroku container:release web
```

### Environment Variables
- `PORT`: Server port (default: 8080)
- Cloud platforms automatically set this variable

## ⚠️ Important Notes

### Security Considerations
- **Passwords stored in plain text** - Use bcrypt/hashing in production
- **No JWT/token authentication** - Implement proper session management for production
- **File-based storage** - Replace with a real database (PostgreSQL, MongoDB, etc.)
- **No input validation** - Add comprehensive validation on backend
- **CORS set to allow all origins** - Restrict to specific domains in production

### Performance Limitations
- Entire JSON files rewritten on each mutation
- No indexing or query optimization
- Synchronized methods may bottleneck under high load
- Not suitable for large datasets (>1000 trains/users)

### Known Issues
- Race conditions possible with multiple concurrent bookings despite synchronization
- No seat locking mechanism during booking flow
- Frontend assumes backend on same origin (relative URLs)

## 🤝 Contributing

This is a demonstration project. Feel free to fork and enhance with:
- Database integration (JPA with PostgreSQL/MySQL)
- JWT authentication
- Payment gateway integration
- Real-time notifications (WebSockets)
- Admin dashboard
- Comprehensive test coverage

## 📝 License

This project is provided as-is for educational purposes. Add appropriate license if planning commercial use.

## 📧 Support

For issues or questions, please open an issue on the GitHub repository.