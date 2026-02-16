package org.student.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.student.dto.SubmitAssignmentRequest;

public class SubmissionContentValidator implements ConstraintValidator<ValidSubmissionContent, SubmitAssignmentRequest> {

    @Override
    public void initialize(ValidSubmissionContent constraintAnnotation) {
    }

    @Override
    public boolean isValid(SubmitAssignmentRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return false;
        }

        boolean hasSubmissionText = request.getSubmissionText() != null && 
                                   !request.getSubmissionText().trim().isEmpty();
        boolean hasAttachmentUrl = request.getAttachmentUrl() != null && 
                                   !request.getAttachmentUrl().trim().isEmpty();

        return hasSubmissionText || hasAttachmentUrl;
    }
}
