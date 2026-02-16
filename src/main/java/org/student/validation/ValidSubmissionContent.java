package org.student.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = SubmissionContentValidator.class)
@Documented
public @interface ValidSubmissionContent {
    String message() default "Please provide either submission text or an attachment URL";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
