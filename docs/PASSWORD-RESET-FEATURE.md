# Password Reset Feature - Implementation Summary

## Overview
Implemented a secure password reset feature using OTP (One-Time Password) verification sent via email. Works for both teachers and students.

## Features

### User Flow
1. User clicks "Forgot Password?" on login page
2. Enters their registered email address
3. Receives a 6-digit OTP via email (valid for 10 minutes)
4. Enters the OTP to verify identity
5. Sets a new password
6. Redirected to login page

### Security Features
- OTP expires after 10 minutes
- OTP can only be used once
- Secure random OTP generation
- Password hashing with BCrypt
- Email verification required
- Old tokens are automatically cleaned up

## Backend Implementation

### New Entities

#### PasswordResetToken
**File**: `src/main/java/org/student/entity/PasswordResetToken.java`
- `id`: Primary key
- `email`: User's email
- `otp`: 6-digit OTP
- `createdAt`: Token creation timestamp
- `expiresAt`: Token expiration timestamp (10 minutes from creation)
- `used`: Boolean flag to prevent reuse

### New Repositories

#### PasswordResetTokenRepository
**File**: `src/main/java/org/student/repository/PasswordResetTokenRepository.java`
- `findByEmailAndOtpAndUsedFalseAndExpiresAtAfter()`: Find valid OTP
- `deleteByEmail()`: Delete existing tokens for email
- `deleteByExpiresAtBefore()`: Cleanup expired tokens

### New Services

#### EmailService
**File**: `src/main/java/org/student/service/EmailService.java`
- `sendOtpEmail()`: Sends OTP to user's email
- **Current Implementation**: Logs OTP to console (for development)
- **Production**: Integrate with SendGrid, AWS SES, or SMTP

#### PasswordResetService
**File**: `src/main/java/org/student/service/PasswordResetService.java`
- `sendPasswordResetOtp()`: Generate and send OTP
- `verifyOtp()`: Verify OTP validity
- `resetPassword()`: Update password after OTP verification
- `cleanupExpiredTokens()`: Remove expired tokens
- `generateOtp()`: Generate secure 6-digit OTP

### New DTOs

1. **ForgotPasswordRequest**: `{ email }`
2. **VerifyOtpRequest**: `{ email, otp }`
3. **ResetPasswordRequest**: `{ email, otp, newPassword }`

### Controller Endpoints

**File**: `src/main/java/org/student/controller/AuthController.java`

#### POST /api/auth/forgot-password
- Request: `{ email }`
- Response: `{ success: true, message: "OTP sent to your email" }`
- Generates OTP and sends to email

#### POST /api/auth/verify-otp
- Request: `{ email, otp }`
- Response: `{ success: true, message: "OTP verified successfully" }`
- Verifies OTP without consuming it

#### POST /api/auth/reset-password
- Request: `{ email, otp, newPassword }`
- Response: `{ success: true, message: "Password reset successfully" }`
- Verifies OTP, updates password, marks OTP as used

## Frontend Implementation

### New Page: ForgotPassword
**File**: `frontend/src/pages/ForgotPassword.jsx`

#### Step 1: Enter Email
- User enters registered email
- Validates email format
- Sends OTP request to backend

#### Step 2: Enter OTP
- User enters 6-digit OTP
- Large, centered input field
- Shows email where OTP was sent
- "Resend OTP" option available
- "Change Email" option to go back

#### Step 3: Set New Password
- User enters new password
- Confirms password (must match)
- Minimum 6 characters validation
- Submits to reset password

### UI Features
- Animated math symbols background
- Random math quotes
- Step-by-step progress
- Clear error and success messages
- Loading states for all actions
- Responsive design

### Updated Login Page
**File**: `frontend/src/pages/Login.jsx`
- Added "Forgot Password?" link below password field
- Links to `/forgot-password` route

### Routes
**File**: `frontend/src/App.jsx`
- Added route: `/forgot-password` → ForgotPassword component

## Database Schema

```sql
CREATE TABLE password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_password_reset_email ON password_reset_tokens(email);
CREATE INDEX idx_password_reset_expires ON password_reset_tokens(expires_at);
```

## Email Integration (Production)

### Current Implementation
The `EmailService` currently logs OTP to the console for development/testing.

### Production Setup Options

#### Option 1: SMTP (Gmail, Outlook, etc.)
Add to `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

Add to `application.yml`:
```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: your-email@gmail.com
    password: your-app-password
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
```

Update `EmailService.java`:
```java
@Autowired
private JavaMailSender mailSender;

public void sendOtpEmail(String toEmail, String otp) {
    MimeMessage message = mailSender.createMimeMessage();
    MimeMessageHelper helper = new MimeMessageHelper(message, true);
    helper.setTo(toEmail);
    helper.setSubject("Password Reset OTP - Padma's Math Centre");
    helper.setText(String.format(
        "Dear User,\n\n" +
        "Your OTP for password reset is: %s\n\n" +
        "This OTP is valid for 10 minutes.\n\n" +
        "Best regards,\n" +
        "Padma's Math Centre", otp));
    mailSender.send(message);
}
```

#### Option 2: SendGrid
Add dependency and use SendGrid API

#### Option 3: AWS SES
Use AWS Simple Email Service

## Testing Instructions

### Backend Testing

1. **Send OTP**:
```bash
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com"}'
```

Check console logs for OTP.

2. **Verify OTP**:
```bash
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","otp":"123456"}'
```

3. **Reset Password**:
```bash
curl -X POST http://localhost:8080/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","otp":"123456","newPassword":"newpass123"}'
```

### Frontend Testing

1. Go to login page
2. Click "Forgot Password?"
3. Enter registered email
4. Check backend console for OTP
5. Enter OTP
6. Set new password
7. Login with new password

### Test Cases

- [ ] Valid email sends OTP
- [ ] Invalid email shows error
- [ ] Correct OTP verification succeeds
- [ ] Incorrect OTP shows error
- [ ] Expired OTP (>10 min) shows error
- [ ] Used OTP cannot be reused
- [ ] Password reset updates database
- [ ] Can login with new password
- [ ] Old password no longer works
- [ ] Works for both students and teachers
- [ ] Resend OTP generates new OTP
- [ ] Password validation (min 6 chars)
- [ ] Password confirmation matching

## Security Considerations

1. **OTP Expiry**: 10 minutes to prevent brute force
2. **Single Use**: OTP marked as used after successful reset
3. **Secure Generation**: Uses SecureRandom for OTP
4. **Password Hashing**: BCrypt with salt
5. **Email Verification**: Only registered emails can reset
6. **Rate Limiting**: Consider adding rate limiting in production
7. **HTTPS**: Always use HTTPS in production

## Future Enhancements

- Add rate limiting (max 3 OTP requests per hour)
- Add CAPTCHA to prevent automated attacks
- Send email notification after successful password reset
- Add password strength meter
- Store password reset history
- Add account lockout after multiple failed attempts
- Support SMS OTP as alternative
- Add "Remember this device" option

## Troubleshooting

### OTP Not Received
- Check console logs (development mode)
- Verify email service configuration
- Check spam folder (production)
- Ensure email exists in database

### OTP Invalid/Expired
- OTP expires after 10 minutes
- Each OTP can only be used once
- Generate new OTP if expired

### Password Reset Fails
- Ensure OTP is verified first
- Check password meets requirements (min 6 chars)
- Verify email and OTP match

## Configuration

### OTP Settings
Located in `PasswordResetService.java`:
```java
private static final int OTP_LENGTH = 6;
private static final int OTP_EXPIRY_MINUTES = 10;
```

Adjust these values as needed for your requirements.
