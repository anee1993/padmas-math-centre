# Security & Credentials Management Guide

## Overview
This guide explains how to securely manage API keys, passwords, and other sensitive credentials in your application.

## ⚠️ Security Issues Fixed

### Before (Insecure)
- Database password hardcoded in `application.yml`
- JWT secret hardcoded
- Supabase API key hardcoded
- Email credentials hardcoded
- All secrets committed to Git repository

### After (Secure)
- All secrets moved to environment variables
- `.env` file for local development (not committed to Git)
- `.env.example` as template (safe to commit)
- Production uses system environment variables

## Quick Start

### Step 1: Copy Environment Template
```bash
cp .env.example .env
```

### Step 2: Fill in Your Credentials
Edit `.env` file with your actual values:
```bash
# Database
DATABASE_PASSWORD=your-actual-password

# JWT
JWT_SECRET=your-actual-jwt-secret

# Supabase
SUPABASE_KEY=your-actual-supabase-key

# Email
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Step 3: Load Environment Variables

#### Option A: Using IDE (IntelliJ IDEA)
1. Install "EnvFile" plugin
2. Run → Edit Configurations
3. Add `.env` file to configuration
4. Run application

#### Option B: Using Command Line (Windows)
```cmd
# Load from .env file
for /f "tokens=*" %i in (.env) do set %i

# Run application
mvn spring-boot:run
```

#### Option C: Using PowerShell
```powershell
# Load from .env file
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], 'Process')
    }
}

# Run application
mvn spring-boot:run
```

#### Option D: Manual Export (Linux/Mac)
```bash
export DATABASE_PASSWORD=your-password
export JWT_SECRET=your-secret
export SUPABASE_KEY=your-key
# ... etc

mvn spring-boot:run
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_PASSWORD` | PostgreSQL database password | `MySecurePass123!` |
| `JWT_SECRET` | Secret key for JWT token signing (min 256 bits) | `your-long-secret-key-here` |
| `SUPABASE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIs...` |

### Optional Variables (with defaults)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection URL | `jdbc:postgresql://...` |
| `DATABASE_USERNAME` | Database username | `postgres` |
| `JWT_EXPIRATION` | JWT token expiration (ms) | `86400000` (24 hours) |
| `SUPABASE_URL` | Supabase project URL | `https://...supabase.co` |
| `MAIL_ENABLED` | Enable email sending | `false` |
| `MAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `MAIL_PORT` | SMTP server port | `587` |
| `MAIL_USERNAME` | Email account username | - |
| `MAIL_PASSWORD` | Email account password | - |
| `MAIL_FROM` | From email address | `noreply@...` |
| `MAIL_FROM_NAME` | From name | `Padma's Math Centre` |
| `SERVER_PORT` | Application port | `8080` |
| `SHOW_SQL` | Show SQL queries in logs | `false` |

## Production Deployment

### Option 1: System Environment Variables

#### Windows
```cmd
# Set permanently
setx DATABASE_PASSWORD "your-password"
setx JWT_SECRET "your-secret"
setx SUPABASE_KEY "your-key"
```

#### Linux/Mac
Add to `/etc/environment` or `~/.bashrc`:
```bash
export DATABASE_PASSWORD="your-password"
export JWT_SECRET="your-secret"
export SUPABASE_KEY="your-key"
```

### Option 2: Docker
```dockerfile
# Dockerfile
FROM openjdk:21-jdk-slim
COPY target/*.jar app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
```

```bash
# Run with environment variables
docker run -e DATABASE_PASSWORD=xxx \
           -e JWT_SECRET=xxx \
           -e SUPABASE_KEY=xxx \
           myapp:latest
```

Or use `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    image: myapp:latest
    environment:
      - DATABASE_PASSWORD=${DATABASE_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - SUPABASE_KEY=${SUPABASE_KEY}
    env_file:
      - .env
```

### Option 3: Cloud Platforms

#### Heroku
```bash
heroku config:set DATABASE_PASSWORD=xxx
heroku config:set JWT_SECRET=xxx
heroku config:set SUPABASE_KEY=xxx
```

#### AWS Elastic Beanstalk
Use Configuration → Software → Environment properties

#### Azure App Service
Use Configuration → Application settings

#### Google Cloud Run
```bash
gcloud run deploy --set-env-vars DATABASE_PASSWORD=xxx,JWT_SECRET=xxx
```

### Option 4: Secrets Management Services

#### AWS Secrets Manager
```java
// Add AWS SDK dependency
// Fetch secrets at runtime
```

#### Azure Key Vault
```java
// Add Azure SDK dependency
// Fetch secrets at runtime
```

#### HashiCorp Vault
```java
// Add Vault SDK dependency
// Fetch secrets at runtime
```

## Security Best Practices

### 1. Never Commit Secrets to Git

**Check before committing:**
```bash
# Search for potential secrets
git grep -i "password"
git grep -i "secret"
git grep -i "key"
```

**If you accidentally committed secrets:**
```bash
# Remove from history (use with caution!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (dangerous!)
git push origin --force --all
```

**Better: Use BFG Repo-Cleaner:**
```bash
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

### 2. Rotate Credentials Regularly

- Change database passwords every 90 days
- Rotate JWT secrets every 6 months
- Update API keys when team members leave
- Use different keys for dev/staging/production

### 3. Use Strong Secrets

**JWT Secret:**
```bash
# Generate strong JWT secret (256 bits)
openssl rand -base64 32
```

**Database Password:**
- Minimum 16 characters
- Mix of uppercase, lowercase, numbers, symbols
- No dictionary words

### 4. Principle of Least Privilege

- Use read-only database users where possible
- Limit API key permissions
- Use separate keys for different environments

### 5. Monitor Access

- Log all authentication attempts
- Alert on failed login attempts
- Monitor API key usage
- Track database connections

## Development vs Production

### Development (.env file)
```bash
# .env (local development only)
DATABASE_PASSWORD=dev-password
JWT_SECRET=dev-secret-not-for-production
MAIL_ENABLED=false
SHOW_SQL=true
```

### Production (System environment)
```bash
# Production environment variables
DATABASE_PASSWORD=strong-production-password
JWT_SECRET=strong-production-secret-256-bits
MAIL_ENABLED=true
SHOW_SQL=false
```

## Troubleshooting

### Application Won't Start

**Error: "Could not resolve placeholder 'DATABASE_PASSWORD'"**

Solution: Environment variable not set
```bash
# Check if variable is set
echo %DATABASE_PASSWORD%  # Windows
echo $DATABASE_PASSWORD   # Linux/Mac

# Set the variable
set DATABASE_PASSWORD=your-password  # Windows
export DATABASE_PASSWORD=your-password  # Linux/Mac
```

### Environment Variables Not Loading

**Check:**
1. `.env` file exists in project root
2. Variables are in format `KEY=value` (no spaces around `=`)
3. No quotes around values (unless value contains spaces)
4. File encoding is UTF-8

### Different Values in Different Terminals

**Issue:** Environment variables are process-specific

**Solution:** 
- Set system-wide (Windows: `setx`, Linux: `/etc/environment`)
- Or load `.env` in each terminal session
- Or use IDE configuration

## IDE Configuration

### IntelliJ IDEA

1. **Install EnvFile Plugin**:
   - File → Settings → Plugins
   - Search "EnvFile"
   - Install and restart

2. **Configure Run Configuration**:
   - Run → Edit Configurations
   - Select your Spring Boot configuration
   - Enable EnvFile tab
   - Add `.env` file
   - Check "Enable EnvFile"

### VS Code

1. **Create launch.json**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Spring Boot",
      "request": "launch",
      "mainClass": "org.student.ClassroomApplication",
      "envFile": "${workspaceFolder}/.env"
    }
  ]
}
```

### Eclipse

1. **Run Configurations**:
   - Run → Run Configurations
   - Select your configuration
   - Environment tab
   - Add variables manually or import from file

## Checklist

### Before Committing
- [ ] No passwords in code
- [ ] No API keys in code
- [ ] `.env` in `.gitignore`
- [ ] `.env.example` updated
- [ ] Secrets documented in this guide

### Before Deploying
- [ ] Production secrets generated
- [ ] Environment variables set on server
- [ ] Different secrets for prod vs dev
- [ ] Secrets backed up securely
- [ ] Team members have access to secrets (via secure channel)

### Regular Maintenance
- [ ] Rotate credentials quarterly
- [ ] Review access logs monthly
- [ ] Update `.env.example` when adding new secrets
- [ ] Document new environment variables

## Getting Help

### If Secrets Are Compromised

1. **Immediately rotate all credentials**:
   - Change database password
   - Generate new JWT secret
   - Regenerate API keys
   - Update email passwords

2. **Check for unauthorized access**:
   - Review database logs
   - Check API usage
   - Monitor for suspicious activity

3. **Update all environments**:
   - Development
   - Staging
   - Production

4. **Notify team members**

### Support Resources

- Spring Boot Configuration: https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config
- Environment Variables: https://12factor.net/config
- Secrets Management: https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password

## Summary

✅ **Do:**
- Use environment variables for all secrets
- Keep `.env` file local (never commit)
- Use `.env.example` as template
- Rotate credentials regularly
- Use different secrets for each environment

❌ **Don't:**
- Hardcode secrets in code
- Commit `.env` to Git
- Share secrets via email/chat
- Use same secrets for dev and prod
- Store secrets in plain text files (except `.env` locally)

## Quick Reference

```bash
# Create .env from template
cp .env.example .env

# Edit with your values
notepad .env  # Windows
nano .env     # Linux/Mac

# Load and run (Windows)
for /f "tokens=*" %i in (.env) do set %i && mvn spring-boot:run

# Load and run (Linux/Mac)
export $(cat .env | xargs) && mvn spring-boot:run
```

Remember: **Security is not a one-time task, it's an ongoing process!**
