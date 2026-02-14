# Email Setup Guide for OTP Delivery

## Overview
The application now supports actual email delivery for OTP (One-Time Password) via SMTP. By default, it runs in development mode (logs to console). Follow this guide to enable real email sending.

## Current Status
- **Development Mode** (default): OTPs are logged to console
- **Production Mode**: OTPs are sent via email using SMTP

## Quick Start

### Step 1: Choose Email Provider

You can use any SMTP email service. Popular options:

1. **Gmail** (Free, easy to set up)
2. **Outlook/Hotmail** (Free)
3. **SendGrid** (Professional, free tier available)
4. **AWS SES** (Professional, pay-as-you-go)
5. **Custom SMTP Server**

## Option 1: Gmail Setup (Recommended for Testing)

### 1.1 Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security**
3. Enable **2-Step Verification**

### 1.2 Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter name: "Padma's Math Centre"
5. Click **Generate**
6. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### 1.3 Update application.yml

```yaml
mail:
  enabled: true  # Change from false to true
  host: smtp.gmail.com
  port: 587
  username: your-email@gmail.com  # Your Gmail address
  password: abcdefghijklmnop  # Your 16-char app password (no spaces)
  from: your-email@gmail.com
  from-name: Padma's Math Centre
  properties:
    mail:
      smtp:
        auth: true
        starttls:
          enable: true
        connectiontimeout: 5000
        timeout: 5000
        writetimeout: 5000
```

### 1.4 Restart Application
```bash
# Stop the application
# Restart it
mvn spring-boot:run
```

### 1.5 Test
1. Go to forgot password page
2. Enter a valid email
3. Check the email inbox for OTP

## Option 2: Outlook/Hotmail Setup

### 2.1 Update application.yml

```yaml
mail:
  enabled: true
  host: smtp-mail.outlook.com
  port: 587
  username: your-email@outlook.com
  password: your-password
  from: your-email@outlook.com
  from-name: Padma's Math Centre
  properties:
    mail:
      smtp:
        auth: true
        starttls:
          enable: true
        connectiontimeout: 5000
        timeout: 5000
        writetimeout: 5000
```

## Option 3: SendGrid (Professional)

### 3.1 Sign Up
1. Go to: https://sendgrid.com/
2. Create free account (100 emails/day free)
3. Verify your email

### 3.2 Create API Key
1. Go to Settings → API Keys
2. Create API Key with "Mail Send" permissions
3. Copy the API key

### 3.3 Update application.yml

```yaml
mail:
  enabled: true
  host: smtp.sendgrid.net
  port: 587
  username: apikey  # Literally the word "apikey"
  password: YOUR_SENDGRID_API_KEY
  from: noreply@yourdomain.com
  from-name: Padma's Math Centre
  properties:
    mail:
      smtp:
        auth: true
        starttls:
          enable: true
        connectiontimeout: 5000
        timeout: 5000
        writetimeout: 5000
```

## Option 4: AWS SES (Professional)

### 4.1 Setup AWS SES
1. Go to AWS Console → SES
2. Verify your email/domain
3. Create SMTP credentials

### 4.2 Update application.yml

```yaml
mail:
  enabled: true
  host: email-smtp.us-east-1.amazonaws.com  # Your region
  port: 587
  username: YOUR_SMTP_USERNAME
  password: YOUR_SMTP_PASSWORD
  from: noreply@yourdomain.com
  from-name: Padma's Math Centre
  properties:
    mail:
      smtp:
        auth: true
        starttls:
          enable: true
        connectiontimeout: 5000
        timeout: 5000
        writetimeout: 5000
```

## Configuration Reference

### All Configuration Options

```yaml
mail:
  enabled: false              # Set to true to enable email sending
  host: smtp.gmail.com        # SMTP server hostname
  port: 587                   # SMTP port (587 for TLS, 465 for SSL)
  username: your-email        # SMTP username (usually your email)
  password: your-password     # SMTP password or app password
  from: noreply@domain.com    # From email address
  from-name: Your App Name    # From name displayed in email
  properties:
    mail:
      smtp:
        auth: true            # Enable authentication
        starttls:
          enable: true        # Enable TLS encryption
        connectiontimeout: 5000  # Connection timeout (ms)
        timeout: 5000            # Read timeout (ms)
        writetimeout: 5000       # Write timeout (ms)
```

## Email Template

The OTP email includes:
- Professional HTML design
- Large, centered OTP display
- Security warnings
- 10-minute validity notice
- Branded with Padma's Math Centre theme
- Math symbols decoration
- Mobile-responsive design

## Testing

### Test Email Sending

1. **Start Application**:
```bash
mvn spring-boot:run
```

2. **Check Logs**:
Look for:
```
OTP email sent successfully to: user@example.com
```

3. **Test Forgot Password Flow**:
- Go to login page
- Click "Forgot Password?"
- Enter email address
- Check email inbox (and spam folder)

### Troubleshooting

#### Email Not Received

1. **Check Spam Folder**: Gmail/Outlook may mark it as spam initially

2. **Check Logs**: Look for error messages in console

3. **Verify Configuration**:
   - Username and password correct?
   - App password (not regular password) for Gmail?
   - `mail.enabled` set to `true`?

4. **Test SMTP Connection**:
```bash
telnet smtp.gmail.com 587
```

#### Common Errors

**Error: Authentication failed**
- Solution: Use app password for Gmail, not regular password
- Solution: Enable "Less secure app access" (not recommended)

**Error: Connection timeout**
- Solution: Check firewall/network settings
- Solution: Try different port (465 for SSL)

**Error: 535 Authentication failed**
- Solution: Verify username/password
- Solution: Check if 2FA is enabled (need app password)

**Error: 550 Relay not permitted**
- Solution: Verify "from" email matches authenticated account

## Security Best Practices

### 1. Use Environment Variables (Production)

Don't hardcode credentials in `application.yml`. Use environment variables:

```yaml
mail:
  enabled: ${MAIL_ENABLED:false}
  host: ${MAIL_HOST:smtp.gmail.com}
  port: ${MAIL_PORT:587}
  username: ${MAIL_USERNAME:}
  password: ${MAIL_PASSWORD:}
  from: ${MAIL_FROM:noreply@padmasmathcentre.com}
  from-name: ${MAIL_FROM_NAME:Padma's Math Centre}
```

Set environment variables:
```bash
export MAIL_ENABLED=true
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-app-password
```

### 2. Use App Passwords

Never use your main email password. Always use app-specific passwords.

### 3. Limit Email Rate

Consider adding rate limiting to prevent abuse:
- Max 3 OTP requests per email per hour
- Max 10 OTP requests per IP per hour

### 4. Monitor Email Delivery

Log all email attempts for monitoring:
- Success/failure rates
- Bounce rates
- Spam complaints

## Development vs Production

### Development Mode (Default)
```yaml
mail:
  enabled: false
```
- OTPs logged to console
- No actual emails sent
- Fast testing
- No email service needed

### Production Mode
```yaml
mail:
  enabled: true
```
- Real emails sent via SMTP
- Professional appearance
- Requires email service configuration
- Monitor delivery rates

## Cost Considerations

### Free Tiers
- **Gmail**: Free (with limits)
- **Outlook**: Free (with limits)
- **SendGrid**: 100 emails/day free
- **AWS SES**: 62,000 emails/month free (first year)

### Paid Options
- **SendGrid**: $19.95/month for 50,000 emails
- **AWS SES**: $0.10 per 1,000 emails
- **Mailgun**: $35/month for 50,000 emails

## Email Deliverability Tips

### 1. Verify Domain (Professional)
- Add SPF record
- Add DKIM record
- Add DMARC record

### 2. Use Professional Email
- Use domain email (e.g., noreply@padmasmathcentre.com)
- Avoid free email services in production

### 3. Warm Up Email
- Start with low volume
- Gradually increase sending rate
- Monitor bounce/spam rates

### 4. Content Best Practices
- Clear subject line
- Professional HTML design
- Include unsubscribe link (if marketing)
- Avoid spam trigger words

## Monitoring

### Check Email Logs

```bash
# View application logs
tail -f logs/application.log | grep "OTP email"
```

### Success Indicators
```
OTP email sent successfully to: user@example.com
```

### Failure Indicators
```
Failed to send OTP email to: user@example.com
```

## Support

### Gmail Issues
- Help: https://support.google.com/mail/
- App Passwords: https://support.google.com/accounts/answer/185833

### SendGrid Issues
- Docs: https://docs.sendgrid.com/
- Support: https://support.sendgrid.com/

### AWS SES Issues
- Docs: https://docs.aws.amazon.com/ses/
- Support: AWS Support Console

## Next Steps

1. Choose email provider (Gmail recommended for testing)
2. Configure credentials in `application.yml`
3. Set `mail.enabled: true`
4. Restart application
5. Test forgot password flow
6. Monitor logs for issues
7. Consider environment variables for production
8. Set up domain verification (optional, for production)

## Quick Test Checklist

- [ ] Email provider chosen
- [ ] App password generated (if Gmail)
- [ ] `application.yml` updated
- [ ] `mail.enabled` set to `true`
- [ ] Application restarted
- [ ] Forgot password tested
- [ ] Email received in inbox
- [ ] OTP works correctly
- [ ] Logs show success message
- [ ] Spam folder checked (if not in inbox)
