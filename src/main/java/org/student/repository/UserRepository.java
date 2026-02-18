package org.student.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.student.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findBySupabaseUserId(String supabaseUserId);
    boolean existsByEmail(String email);
    List<User> findByRoleAndStatus(User.Role role, User.RegistrationStatus status);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.studentProfile WHERE u.role = :role AND u.status = :status")
    List<User> findByRoleAndStatusWithProfile(@Param("role") User.Role role, @Param("status") User.RegistrationStatus status);
}
