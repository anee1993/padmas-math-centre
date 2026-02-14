package org.student.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.student.entity.PasswordResetToken;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    
    Optional<PasswordResetToken> findByEmailAndOtpAndUsedFalseAndExpiresAtAfter(
        String email, String otp, LocalDateTime currentTime);
    
    void deleteByEmail(String email);
    
    void deleteByExpiresAtBefore(LocalDateTime currentTime);
}
