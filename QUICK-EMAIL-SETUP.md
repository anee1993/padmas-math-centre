# Quick Email Setup - 5 Minutes

## Gmail Setup (Easiest)

### Step 1: Get App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Create app password for "Mail"
3. Copy the 16-character password

### Step 2: Update application.yml
```yaml
mail:
  enabled: true  # Change this from false to true
  username: your-email@gmail.com
  password: abcdefghijklmnop  # Your 16-char app password (no spaces)
  from: your-email@gmail.com
```

### Step 3: Restart Application
```bash
mvn spring-boot:run
```

### Step 4: Test
1. Go to login page
2. Click "Forgot Password?"
3. Enter email
4. Check inbox for OTP email

## That's It! 🎉

### Troubleshooting

**Email not received?**
- Check spam folder
- Verify app password is correct (no spaces)
- Make sure `mail.enabled: true`

**Authentication failed?**
- You need an App Password, not your regular Gmail password
- Enable 2-Factor Authentication first
- Generate new app password

**Still not working?**
- Check console logs for errors
- Verify email address is correct
- Try with a different email provider

## Development Mode (Default)

If you don't want to set up email yet:
```yaml
mail:
  enabled: false  # Keep this as false
```

OTPs will be printed in the console logs instead.

## Need More Help?

See `EMAIL-SETUP-GUIDE.md` for:
- Detailed instructions
- Other email providers (Outlook, SendGrid, AWS SES)
- Troubleshooting guide
- Production setup
- Security best practices
