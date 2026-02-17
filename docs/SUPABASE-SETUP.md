# Supabase PostgreSQL Configuration

## Database Connection Details

Your application is now configured to connect to Supabase PostgreSQL.

### Connection Information
- **Host:** db.bvtawdcbfkwbklhhovre.supabase.co
- **Port:** 5432
- **Database:** postgres
- **Username:** postgres
- **JDBC URL:** jdbc:postgresql://db.bvtawdcbfkwbklhhovre.supabase.co:5432/postgres

## Configuration Files

### application.yml
The main configuration file contains your database connection settings with HikariCP connection pooling.

**Connection Pool Settings:**
- Maximum pool size: 10
- Minimum idle connections: 5
- Connection timeout: 30 seconds
- Idle timeout: 10 minutes
- Max lifetime: 30 minutes

### Hibernate Settings
- **DDL Auto:** `update` - Automatically updates schema based on entities
- **Dialect:** PostgreSQL
- **Show SQL:** Enabled for debugging (disable in production)

## Security Recommendations

⚠️ **IMPORTANT:** Your database password is currently in `application.yml`. For production:

### Option 1: Environment Variables (Recommended)

1. Update `application.yml`:
```yaml
spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

2. Set environment variables:
```bash
export DB_URL=jdbc:postgresql://db.bvtawdcbfkwbklhhovre.supabase.co:5432/postgres
export DB_USERNAME=postgres
export DB_PASSWORD=your-database-password-here
```

### Option 2: Spring Profiles

Create `application-prod.yml` (already in .gitignore):
```yaml
spring:
  datasource:
    password: your-database-password-here
  jpa:
    show-sql: false
```

Run with: `mvn spring-boot:run -Dspring-boot.run.profiles=prod`

### Option 3: External Configuration

Store credentials in a separate file outside the project:
```bash
java -jar app.jar --spring.config.location=file:/path/to/config/
```

## Database Schema

On first run, Hibernate will automatically create these tables:

### users
- id (BIGSERIAL PRIMARY KEY)
- email (VARCHAR UNIQUE)
- password_hash (VARCHAR)
- role (VARCHAR) - STUDENT or TEACHER
- status (VARCHAR) - PENDING, APPROVED, REJECTED
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### student_profiles
- id (BIGSERIAL PRIMARY KEY)
- user_id (BIGINT FOREIGN KEY)
- full_name (VARCHAR)
- date_of_birth (DATE)
- gender (VARCHAR) - MALE, FEMALE, OTHER
- class_grade (INTEGER)

## Supabase Dashboard Access

You can view and manage your database through:
1. Supabase Dashboard → Table Editor
2. Supabase Dashboard → SQL Editor
3. Direct PostgreSQL client connection

## Testing the Connection

Run the application:
```bash
mvn clean install
mvn spring-boot:run
```

Check the logs for:
```
Hibernate: create table users (...)
Hibernate: create table student_profiles (...)
Teacher account created: teacher@mathtuition.com / Teacher@123
```

## Troubleshooting

### Connection Timeout
If you get connection timeouts:
- Check Supabase project is not paused
- Verify IP allowlist in Supabase settings
- Check firewall settings

### SSL Connection Issues
Supabase requires SSL. If you encounter SSL errors, add to datasource URL:
```
?sslmode=require
```

### Pool Exhaustion
If you see "Connection pool exhausted" errors:
- Increase `maximum-pool-size` in application.yml
- Check for connection leaks in your code
- Monitor active connections in Supabase dashboard

## Development vs Production

### Development (H2 In-Memory)
Use the dev profile for local development without Supabase:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

This uses H2 in-memory database (see `application-dev.yml`)

### Production (Supabase)
Default profile uses Supabase PostgreSQL (see `application.yml`)

## Monitoring

Monitor your database in Supabase:
- **Dashboard → Database → Connection Pooling**
- **Dashboard → Database → Logs**
- **Dashboard → Database → Backups**

## Backup Strategy

Supabase provides:
- Daily automatic backups (retained for 7 days on free tier)
- Point-in-time recovery (paid plans)
- Manual backups via SQL dumps

## Next Steps

1. ✅ Database connected
2. ⚠️ Move password to environment variables
3. 📝 Test all API endpoints with Supabase
4. 🔒 Review Supabase security rules
5. 📊 Set up monitoring and alerts
6. 🔄 Configure backup strategy
