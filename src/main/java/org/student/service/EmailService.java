package org.student.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    private final JavaMailSender mailSender;
    
    @Value("${mail.enabled:false}")
    private boolean mailEnabled;
    
    @Value("${mail.from:noreply@padmasmathcentre.com}")
    private String fromEmail;
    
    @Value("${mail.from-name:Padma's Math Centre}")
    private String fromName;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    /**
     * Sends OTP email to the user
     * If mail.enabled=false, logs to console (development mode)
     * If mail.enabled=true, sends actual email via SMTP
     */
    public void sendOtpEmail(String toEmail, String otp) {
        if (!mailEnabled) {
            // Development mode - log to console
            logOtpToConsole(toEmail, otp);
            return;
        }
        
        try {
            // Production mode - send actual email
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("Password Reset OTP - Padma's Math Centre");
            
            String htmlContent = buildOtpEmailHtml(otp);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            logger.info("OTP email sent successfully to: {}", toEmail);
            
        } catch (MessagingException e) {
            logger.error("Failed to send OTP email to: {}", toEmail, e);
            // Fallback to console logging if email fails
            logOtpToConsole(toEmail, otp);
            throw new RuntimeException("Failed to send OTP email. Please try again later.", e);
        } catch (Exception e) {
            logger.error("Unexpected error sending OTP email to: {}", toEmail, e);
            logOtpToConsole(toEmail, otp);
            throw new RuntimeException("Failed to send OTP email. Please try again later.", e);
        }
    }
    
    private void logOtpToConsole(String toEmail, String otp) {
        logger.info("=".repeat(60));
        logger.info("DEVELOPMENT MODE - OTP EMAIL (Not actually sent)");
        logger.info("To: {}", toEmail);
        logger.info("Subject: Password Reset OTP - Padma's Math Centre");
        logger.info("=".repeat(60));
        logger.info("Dear User,");
        logger.info("");
        logger.info("Your OTP for password reset is: {}", otp);
        logger.info("");
        logger.info("This OTP is valid for 10 minutes.");
        logger.info("If you did not request this, please ignore this email.");
        logger.info("");
        logger.info("Best regards,");
        logger.info("Padma's Math Centre");
        logger.info("=".repeat(60));
    }
    
    private String buildOtpEmailHtml(String otp) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background-color: #f9f9f9;
                        border-radius: 10px;
                        padding: 30px;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .header h1 {
                        color: #4F46E5;
                        margin: 0;
                        font-size: 28px;
                    }
                    .header p {
                        color: #666;
                        margin: 5px 0 0 0;
                        font-size: 14px;
                    }
                    .otp-box {
                        background-color: #4F46E5;
                        color: white;
                        font-size: 32px;
                        font-weight: bold;
                        text-align: center;
                        padding: 20px;
                        border-radius: 8px;
                        letter-spacing: 8px;
                        margin: 30px 0;
                    }
                    .content {
                        background-color: white;
                        padding: 20px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                    }
                    .warning {
                        background-color: #FEF3C7;
                        border-left: 4px solid #F59E0B;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .footer {
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                    }
                    .math-symbols {
                        color: #4F46E5;
                        opacity: 0.3;
                        font-size: 24px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📐 Padma's Math Centre 📊</h1>
                        <p>Password Reset Request</p>
                    </div>
                    
                    <div class="content">
                        <p>Dear User,</p>
                        
                        <p>We received a request to reset your password. Use the OTP below to complete the password reset process:</p>
                        
                        <div class="otp-box">
                            """ + otp + """
                        </div>
                        
                        <p><strong>This OTP is valid for 10 minutes only.</strong></p>
                        
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong><br>
                            If you did not request this password reset, please ignore this email. Your account remains secure.
                        </div>
                        
                        <p>For security reasons, never share this OTP with anyone, including Padma's Math Centre staff.</p>
                    </div>
                    
                    <div class="footer">
                        <p class="math-symbols">∑ π ∫ √ ∞ θ</p>
                        <p>Best regards,<br>
                        <strong>Padma's Math Centre</strong></p>
                        <p style="margin-top: 15px;">
                            This is an automated email. Please do not reply to this message.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """;
    }
}
