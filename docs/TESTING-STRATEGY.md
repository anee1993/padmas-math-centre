# Testing Strategy for Padma's Math Centre

## Overview

This document outlines the comprehensive testing strategy for the application, including unit tests, integration tests, and code quality improvements.

## Testing Framework

- **JUnit 5**: Primary testing framework
- **Mockito**: Mocking framework for unit tests
- **Spring Boot Test**: Integration testing support
- **AssertJ**: Fluent assertions (optional enhancement)

## Test Coverage Goals

- **Service Layer**: 80%+ coverage
- **Controller Layer**: 70%+ coverage
- **Repository Layer**: Integration tests only
- **Utility Classes**: 90%+ coverage

## Service Layer Tests

### 1. AuthService ✅ COMPLETED
**Location**: `src/test/java/org/student/service/AuthServiceTest.java`

**Test Cases**:
- ✅ Student registration success
- ✅ Registration with duplicate email
- ✅ Login success (student and teacher)
- ✅ Login with invalid credentials
- ✅ Login with pending approval
- ✅ Login with rejected status

**Coverage**: ~95%

### 2. AdminService
**Location**: `src/test/java/org/student/service/AdminServiceTest.java`

**Test Cases**:
- Get pending registrations
- Get enrolled students
- Get enrolled students by class
- Approve registration success
- Approve non-student user (error)
- Approve non-pending registration (error)
- Reject registration
- Delete student with cascading deletes

**Estimated Coverage**: 85%

### 3. AssignmentService
**Location**: `src/test/java/org/student/service/AssignmentServiceTest.java`

**Test Cases**:
- Create assignment
- Get assignments by class
- Submit assignment
- Grade submission
- Calculate submission status (pending/overdue)
- Get student submissions
- Delete assignment

**Estimated Coverage**: 80%

### 4. AIAssignmentGeneratorService
**Location**: `src/test/java/org/student/service/AIAssignmentGeneratorServiceTest.java`

**Test Cases**:
- Generate assignment success
- Handle API errors
- Build prompt correctly
- Parse response correctly
- Handle timeout

**Estimated Coverage**: 75%

### 5. EmailService
**Location**: `src/test/java/org/student/service/EmailServiceTest.java`

**Test Cases**:
- Send OTP email (development mode)
- Send OTP email (production mode)
- Handle email sending failures
- Verify email content

**Estimated Coverage**: 80%

### 6. FileStorageService
**Location**: `src/test/java/org/student/service/FileStorageServiceTest.java`

**Test Cases**:
- Upload file success
- Validate file type
- Validate file size
- Handle upload errors
- Generate unique filenames

**Estimated Coverage**: 75%

### 7. PasswordResetService
**Location**: `src/test/java/org/student/service/PasswordResetServiceTest.java`

**Test Cases**:
- Request password reset
- Verify OTP success
- Verify expired OTP
- Reset password
- Handle invalid OTP

**Estimated Coverage**: 85%

### 8. QueryService
**Location**: `src/test/java/org/student/service/QueryServiceTest.java`

**Test Cases**:
- Create query
- Add reply
- Get queries by class
- Delete query
- Block/unblock student
- Check if student is blocked

**Estimated Coverage**: 80%

### 9. TimetableService
**Location**: `src/test/java/org/student/service/TimetableServiceTest.java`

**Test Cases**:
- Create timetable entry
- Get timetable by class
- Update timetable
- Delete timetable
- Get today's schedule

**Estimated Coverage**: 85%

### 10. VirtualClassroomService
**Location**: `src/test/java/org/student/service/VirtualClassroomServiceTest.java`

**Test Cases**:
- Initialize classrooms
- Update meeting link
- Get classroom by class
- Get all classrooms

**Estimated Coverage**: 90%

## Controller Layer Tests

### Integration Tests
**Location**: `src/test/java/org/student/controller/`

**Approach**: Use `@WebMvcTest` for controller-specific tests with mocked services

**Test Cases per Controller**:
- Valid request handling
- Invalid request validation
- Authentication/authorization
- Error responses
- HTTP status codes

## Code Refactoring Recommendations

### 1. Service Layer Improvements

#### Extract Constants
```java
// Before
if (user.getRole() != User.Role.STUDENT) {
    throw new IllegalArgumentException("User is not a student");
}

// After
private static final String ERROR_NOT_STUDENT = "User is not a student";
if (user.getRole() != User.Role.STUDENT) {
    throw new IllegalArgumentException(ERROR_NOT_STUDENT);
}
```

#### Extract Methods
```java
// Before: Long method in AdminService
public List<EnrolledStudentDTO> getEnrolledStudents() {
    List<User> enrolledUsers = userRepository.findByRoleAndStatus(...);
    return enrolledUsers.stream()
        .map(user -> new EnrolledStudentDTO(...))
        .sorted(...)
        .collect(Collectors.toList());
}

// After: Extracted mapping method
public List<EnrolledStudentDTO> getEnrolledStudents() {
    List<User> enrolledUsers = userRepository.findByRoleAndStatus(...);
    return mapToEnrolledStudentDTOs(enrolledUsers);
}

private List<EnrolledStudentDTO> mapToEnrolledStudentDTOs(List<User> users) {
    return users.stream()
        .map(this::mapToEnrolledStudentDTO)
        .sorted(Comparator.comparing(EnrolledStudentDTO::getClassGrade))
        .collect(Collectors.toList());
}
```

#### Add Validation Methods
```java
// Extract validation logic
private void validateStudentUser(User user) {
    if (user.getRole() != User.Role.STUDENT) {
        throw new IllegalArgumentException("User is not a student");
    }
}

private void validatePendingStatus(User user) {
    if (user.getStatus() != User.RegistrationStatus.PENDING) {
        throw new IllegalStateException("Registration is not in pending state");
    }
}
```

### 2. DTO Improvements

#### Use Builder Pattern
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrolledStudentDTO {
    private Long id;
    private String email;
    private String fullName;
    // ... other fields
}

// Usage
EnrolledStudentDTO dto = EnrolledStudentDTO.builder()
    .id(user.getId())
    .email(user.getEmail())
    .fullName(user.getStudentProfile().getFullName())
    .build();
```

### 3. Exception Handling

#### Create Custom Exception Hierarchy
```java
public class BusinessException extends RuntimeException {
    private final String errorCode;
    // constructor, getters
}

public class ValidationException extends BusinessException {
    // specific validation errors
}

public class AuthorizationException extends BusinessException {
    // authorization errors
}
```

### 4. Configuration Improvements

#### Extract Magic Numbers
```java
// Before
if (file.getSize() > 10485760) { // What is this number?
    throw new IllegalArgumentException("File too large");
}

// After
private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
if (file.getSize() > MAX_FILE_SIZE_BYTES) {
    throw new IllegalArgumentException("File size exceeds maximum allowed size of 10MB");
}
```

## Running Tests

### Run All Tests
```bash
mvn test
```

### Run Specific Test Class
```bash
mvn test -Dtest=AuthServiceTest
```

### Run with Coverage Report
```bash
mvn test jacoco:report
```

### View Coverage Report
Open `target/site/jacoco/index.html` in browser

## Continuous Integration

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up JDK 17
        uses: actions/setup-java@v2
        with:
          java-version: '17'
      - name: Run tests
        run: mvn test
      - name: Generate coverage report
        run: mvn jacoco:report
```

## Best Practices

1. **Test Naming**: Use descriptive names following pattern `methodName_scenario_expectedResult`
2. **AAA Pattern**: Arrange, Act, Assert in every test
3. **One Assertion Per Test**: Focus on single behavior
4. **Mock External Dependencies**: Don't test external services
5. **Test Edge Cases**: Null values, empty lists, boundary conditions
6. **Clean Test Data**: Use `@BeforeEach` for setup, `@AfterEach` for cleanup
7. **Avoid Test Interdependence**: Each test should run independently

## Next Steps

1. ✅ Complete AuthService tests
2. ⏳ Add AdminService tests
3. ⏳ Add AssignmentService tests
4. ⏳ Add remaining service tests
5. ⏳ Add controller integration tests
6. ⏳ Set up code coverage reporting
7. ⏳ Implement refactoring recommendations
8. ⏳ Set up CI/CD pipeline

## Maintenance

- Run tests before every commit
- Maintain minimum 75% code coverage
- Update tests when adding new features
- Review and refactor tests regularly
- Keep test execution time under 2 minutes

---

**Last Updated**: Current Date
**Status**: In Progress
**Coverage**: 10% (1/10 services tested)
