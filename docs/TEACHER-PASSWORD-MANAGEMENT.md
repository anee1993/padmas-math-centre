# Teacher Password Management

## Overview

The teacher account password is managed through the database, just like student accounts. The password in environment variables is ONLY used when creating a brand new teacher account for the first time.

## How It Works

### Initial Setup (First Time Only)

When the application starts for the first time:

1. **No teacher account exists** → Creates new teacher account with default password from `TEACHER_DEFAULT_PASSWORD`
2. **Displays message**:
   ```
   ============================================================
   NEW TEACHER ACCOUNT CREATED
   Email: teacher@example.com
   Default Password: Teacher@123
   IMPORTANT: Please change this password after first login!
   ============================================================
   ```

### Subsequent Startups

When the application starts and teacher account already exists:

1. **Does NOT reset the password**
2. **Only updates the teacher's name** if it changed in environment variables
3. **Displays message**:
   ```
   Teacher account exists: teacher@example.com
   Use forgot password feature to reset password if needed
   ```

## Resetting Teacher Password

The teacher can reset their password using the same forgot password feature as students:

### Step 1: Go to Forgot Password Page
- Click "Forgot Password?" link on login page
- Or navigate to: `https://tutorpadma.vercel.app/forgot-password`

### Step 2: Enter Email
- Enter teacher email: `teacher@example.com`
- Click "Send OTP"

### Step 3: Check Email
- An OTP (6-digit code) will be sent to the email
- OTP is valid for 10 minutes

### Step 4: Enter OTP
- Enter the 6-digit OTP received via email
- Click "Verify OTP"

### Step 5: Set New Password
- Enter new password (must meet requirements)
- Confirm new password
- Click "Reset Password"

### Step 6: Login with New Password
- Return to login page
- Login with email and new password

## Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@, #, $, etc.)

## Security Benefits

### Why This Approach is Better

1. **Password Stored in Database**: 
   - Encrypted using BCrypt
   - Cannot be read from environment variables
   - Follows security best practices

2. **Teacher Can Change Password**:
   - No need to update environment variables
   - No need to restart application
   - No need for developer intervention

3. **Self-Service**:
   - Teacher can reset password anytime
   - Uses email verification (OTP)
   - Secure and convenient

4. **No Password in Code**:
   - Default password only used once
   - After first login, it's irrelevant
   - Password changes don't require code changes

## For Developers

### Environment Variables

```env
# Teacher Account Configuration
TEACHER_EMAIL=teacher@example.com
TEACHER_DEFAULT_PASSWORD=Teacher@123  # Only used for NEW accounts
TEACHER_NAME=Teacher Name
```

### Railway Deployment

When deploying to Railway, set these environment variables:
- `TEACHER_EMAIL`
- `TEACHER_DEFAULT_PASSWORD`
- `TEACHER_NAME`

**Important**: If the teacher account already exists in the database, changing `TEACHER_DEFAULT_PASSWORD` in Railway will have NO effect. The teacher must use the forgot password feature.

### Database Migration

If migrating from old email (`teacher@mathtuition.com`) to new email:
- DataInitializer automatically migrates the account
- Keeps the existing password
- Updates email and name
- Teacher can continue using their current password

## Troubleshooting

### Teacher Forgot Password and Can't Reset

**Problem**: Email not being received

**Solutions**:
1. Check spam/junk folder
2. Verify email configuration in Railway:
   - `MAIL_ENABLED=true`
   - `MAIL_USERNAME` and `MAIL_PASSWORD` are correct
3. Check backend logs for email sending errors

### Need to Manually Reset Teacher Password

If absolutely necessary, you can manually reset via database:

1. **Generate BCrypt hash** of new password:
   ```java
   BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
   String hash = encoder.encode("NewPassword@123");
   System.out.println(hash);
   ```

2. **Update database** (Supabase):
   ```sql
   UPDATE users 
   SET password_hash = '$2a$10$...' -- paste BCrypt hash here
   WHERE email = 'teacher@example.com';
   ```

**Note**: This should only be done as a last resort. The forgot password feature is the recommended approach.

## Best Practices

1. **Change Default Password**: After first login, teacher should immediately change the default password

2. **Use Strong Password**: Follow password requirements for security

3. **Don't Share Password**: Teacher should keep password confidential

4. **Regular Updates**: Consider changing password periodically (every 3-6 months)

5. **Use Forgot Password**: If password is forgotten, use the forgot password feature rather than asking developers to reset it

## Summary

- ✅ Teacher password stored securely in database
- ✅ Teacher can reset password independently
- ✅ Default password only used for new accounts
- ✅ No need to restart application to change password
- ✅ Same forgot password flow as students
- ✅ Secure and user-friendly

---

**Last Updated**: Current Date
**Related Documents**: 
- [Password Reset Feature](PASSWORD-RESET-FEATURE.md)
- [Email Setup Guide](../EMAIL-SETUP-GUIDE.md)
