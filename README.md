# Mathematics Tuition Management System

A Spring Boot REST API service for managing student registrations and teacher administration for a mathematics tuition center.

## Features

- Student self-registration with validation
- Teacher approval workflow for new registrations
- JWT-based authentication
- Role-based access control (Student/Teacher)
- Secure password storage with BCrypt
- H2 in-memory database for development

## Tech Stack

- Java 21
- Spring Boot 3.2.2
- Spring Security with JWT
- Spring Data JPA
- H2 Database
- Lombok
- Maven

## Getting Started

### Prerequisites

- Java 21 or higher
- Maven 3.6+

### Running the Application

1. Build the project:
```bash
mvn clean install
```

2. Run the application:
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### Default Teacher Account

```
Email: teacher@mathtuition.com
Password: Teacher@123
```

⚠️ Change this password in production!

## API Endpoints

### Public Endpoints
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login

### Teacher/Admin Endpoints (Requires ROLE_TEACHER)
- `GET /api/admin/pending-registrations` - List pending student registrations
- `PUT /api/admin/approve-registration` - Approve a student registration
- `PUT /api/admin/reject-registration` - Reject a student registration

For detailed API documentation, see [API-DOCUMENTATION.md](docs/API-DOCUMENTATION.md)

## Database Console

### Supabase PostgreSQL (Production)
Access your database through:
- Supabase Dashboard: https://app.supabase.com
- Direct connection using any PostgreSQL client

Connection details:
- Host: `db.bvtawdcbfkwbklhhovre.supabase.co`
- Port: `5432`
- Database: `postgres`
- Username: `postgres`

### H2 Console (Development Only)
For local development with H2, run with dev profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

H2 Console: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:classroomdb`
- Username: `sa`
- Password: (empty)

## Configuration

Key configuration in `src/main/resources/application.yml`:

- `jwt.secret` - JWT signing key (change in production!)
- `jwt.expiration` - Token expiration time (default: 24 hours)
- `server.port` - Application port (default: 8080)

## Project Structure

```
src/main/java/org/student/
├── config/          # Configuration classes
├── controller/      # REST controllers
├── dto/            # Data Transfer Objects
├── entity/         # JPA entities
├── exception/      # Custom exceptions and handlers
├── repository/     # JPA repositories
├── security/       # Security configuration and JWT utilities
└── service/        # Business logic services
```

## Phase 1 Requirements

See [phase1-requirements.md](docs/phase1-requirements.md) for detailed functional and non-functional requirements.

## Testing

Run tests with:
```bash
mvn test
```

## Quick Test Flow

1. Register a student:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "Password@123",
    "dateOfBirth": "2010-05-15",
    "gender": "MALE",
    "classGrade": 8
  }'
```

2. Login as teacher and get token
3. Approve the student registration
4. Student can now login

See [API-DOCUMENTATION.md](docs/API-DOCUMENTATION.md) for complete examples.
