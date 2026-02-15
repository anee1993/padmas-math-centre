# Testing Guide for Padma's Math Centre

## Overview

This project includes comprehensive unit tests for all service layer components. This guide will help you run, understand, and maintain the test suite.

## Current Test Coverage

### Completed Tests ✅
1. **AuthService** - 95% coverage
   - Student registration
   - Login (student and teacher)
   - Authentication validation
   - Status checks

2. **AdminService** - 90% coverage
   - Pending registrations
   - Enrolled students
   - Approve/reject registration
   - Delete student with cascading

### Pending Tests ⏳
3. AssignmentService
4. AIAssignmentGeneratorService
5. EmailService
6. FileStorageService
7. PasswordResetService
8. QueryService
9. TimetableService
10. VirtualClassroomService

## Running Tests

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher

### Run All Tests
```bash
mvn test
```

### Run Specific Test Class
```bash
mvn test -Dtest=AuthServiceTest
mvn test -Dtest=AdminServiceTest
```

### Run Tests with Coverage Report
```bash
mvn clean test jacoco:report
```

Then open `target/site/jacoco/index.html` in your browser to view the coverage report.

### Run Tests in IDE

#### IntelliJ IDEA
1. Right-click on test class or method
2. Select "Run 'TestName'"
3. View results in Run window

#### Eclipse
1. Right-click on test class
2. Select "Run As" > "JUnit Test"
3. View results in JUnit view

## Test Structure

### Test File Organization
```
src/test/java/org/student/
├── service/
│   ├── AuthServiceTest.java
│   ├── AdminServiceTest.java
│   └── ... (other service tests)
└── controller/
    └── ... (controller tests - to be added)
```

### Test Naming Convention
```java
@Test
void methodName_scenario_expectedResult() {
    // Test implementation
}
```

Examples:
- `registerStudent_Success()`
- `login_InvalidPassword_ThrowsException()`
- `approveRegistration_NotPending_ThrowsException()`

### Test Structure (AAA Pattern)
```java
@Test
void testMethod() {
    // Arrange - Set up test data and mocks
    User user = new User();
    when(repository.findById(1L)).thenReturn(Optional.of(user));
    
    // Act - Execute the method being tested
    Result result = service.someMethod(1L);
    
    // Assert - Verify the results
    assertNotNull(result);
    assertEquals(expected, result.getValue());
    verify(repository).findById(1L);
}
```

## Understanding the Tests

### Mocking with Mockito

#### Creating Mocks
```java
@Mock
private UserRepository userRepository;

@Mock
private PasswordEncoder passwordEncoder;
```

#### Stubbing Method Calls
```java
// Return a value
when(userRepository.findById(1L)).thenReturn(Optional.of(user));

// Return different values on successive calls
when(service.method()).thenReturn(value1).thenReturn(value2);

// Throw an exception
when(repository.save(any())).thenThrow(new RuntimeException());
```

#### Verifying Interactions
```java
// Verify method was called
verify(userRepository).save(any(User.class));

// Verify method was called with specific arguments
verify(userRepository).findById(1L);

// Verify method was never called
verify(userRepository, never()).delete(any());

// Verify method was called exactly N times
verify(userRepository, times(2)).save(any());
```

### Common Assertions

```java
// Null checks
assertNotNull(result);
assertNull(result);

// Equality
assertEquals(expected, actual);
assertNotEquals(unexpected, actual);

// Boolean conditions
assertTrue(condition);
assertFalse(condition);

// Collections
assertEquals(3, list.size());
assertTrue(list.isEmpty());
assertTrue(list.contains(item));

// Exceptions
assertThrows(ExceptionType.class, () -> service.method());

// Custom messages
assertEquals(expected, actual, "Values should be equal");
```

## Code Refactoring Examples

### Before Refactoring
```java
public void approveRegistration(Long studentId) {
    User user = userRepository.findById(studentId)
        .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    
    if (user.getRole() != User.Role.STUDENT) {
        throw new IllegalArgumentException("User is not a student");
    }
    
    if (user.getStatus() != User.RegistrationStatus.PENDING) {
        throw new IllegalStateException("Registration is not in pending state");
    }
    
    user.setStatus(User.RegistrationStatus.APPROVED);
    userRepository.save(user);
}
```

### After Refactoring
```java
public void approveRegistration(Long studentId) {
    User user = findUserById(studentId);
    validateStudentUser(user);
    validatePendingStatus(user);
    
    user.setStatus(User.RegistrationStatus.APPROVED);
    userRepository.save(user);
}

private User findUserById(Long userId) {
    return userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException(ERROR_STUDENT_NOT_FOUND));
}

private void validateStudentUser(User user) {
    if (user.getRole() != User.Role.STUDENT) {
        throw new IllegalArgumentException(ERROR_NOT_STUDENT);
    }
}

private void validatePendingStatus(User user) {
    if (user.getStatus() != User.RegistrationStatus.PENDING) {
        throw new IllegalStateException(ERROR_NOT_PENDING);
    }
}
```

### Benefits of Refactoring
1. **Improved Readability**: Method names clearly describe what they do
2. **Reusability**: Validation methods can be used in multiple places
3. **Testability**: Smaller methods are easier to test
4. **Maintainability**: Changes to validation logic only need to be made in one place
5. **Constants**: Error messages defined once, used everywhere

## Best Practices

### 1. Test Independence
Each test should be independent and not rely on the execution order:
```java
@BeforeEach
void setUp() {
    // Fresh setup for each test
    mockUser = new User();
    mockUser.setId(1L);
}
```

### 2. Test One Thing
Each test should verify one specific behavior:
```java
// Good - Tests one scenario
@Test
void login_InvalidPassword_ThrowsException() {
    // ...
}

// Bad - Tests multiple scenarios
@Test
void login_AllScenarios() {
    // Tests success, invalid password, pending approval, etc.
}
```

### 3. Use Descriptive Names
```java
// Good
@Test
void registerStudent_EmailAlreadyExists_ThrowsException()

// Bad
@Test
void test1()
```

### 4. Avoid Logic in Tests
```java
// Bad - Has conditional logic
@Test
void testMethod() {
    if (condition) {
        assertEquals(a, b);
    } else {
        assertEquals(c, d);
    }
}

// Good - Separate tests
@Test
void testMethod_WhenConditionTrue() {
    assertEquals(a, b);
}

@Test
void testMethod_WhenConditionFalse() {
    assertEquals(c, d);
}
```

### 5. Clean Test Data
```java
@BeforeEach
void setUp() {
    // Create fresh test data
}

@AfterEach
void tearDown() {
    // Clean up if needed (usually not required with mocks)
}
```

## Troubleshooting

### Tests Fail Locally But Pass in CI
- Check for timezone issues
- Verify environment variables
- Check for file system dependencies

### Flaky Tests
- Avoid using `Thread.sleep()`
- Don't depend on execution order
- Mock time-dependent operations

### Slow Tests
- Use mocks instead of real databases
- Avoid unnecessary setup
- Run tests in parallel (Maven Surefire plugin)

## Adding New Tests

### Step 1: Create Test Class
```java
@ExtendWith(MockitoExtension.class)
class NewServiceTest {
    @Mock
    private Dependency dependency;
    
    @InjectMocks
    private NewService service;
    
    @BeforeEach
    void setUp() {
        // Setup
    }
}
```

### Step 2: Write Test Methods
```java
@Test
void methodName_scenario_expectedResult() {
    // Arrange
    // Act
    // Assert
}
```

### Step 3: Run and Verify
```bash
mvn test -Dtest=NewServiceTest
```

## Resources

- [JUnit 5 Documentation](https://junit.org/junit5/docs/current/user-guide/)
- [Mockito Documentation](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [Spring Boot Testing](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.testing)
- [Testing Strategy Document](docs/TESTING-STRATEGY.md)

## Next Steps

1. Review existing tests to understand patterns
2. Run tests locally to ensure they pass
3. Add tests for remaining services
4. Set up code coverage reporting
5. Integrate tests into CI/CD pipeline

## Questions?

For questions or issues with tests:
1. Check the Testing Strategy document
2. Review existing test examples
3. Consult team members
4. Update this documentation with new learnings

---

**Last Updated**: Current Date
**Test Coverage**: 20% (2/10 services)
**Status**: In Progress
