package mk.skillio.dto;

import mk.skillio.enums.ApplicationStatus;

import java.time.Instant;
import java.util.List;

public record CompanyApplicationResponse(
        Long id,
        ApplicationStatus status,
        String message,
        Instant createdAt,
        Long studentId,
        String studentName,
        String studentEmail,
        String studentLocation,
        String studentBio,
        List<ApplicantSkillResponse> skills,
        boolean hasCv
) {
}