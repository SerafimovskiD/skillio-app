package mk.skillio.dto;

import mk.skillio.enums.ApplicationStatus;

import java.time.Instant;

public record ApplicationResponse(
        Long id,
        Long postingId,
        String postingTitle,
        String companyName,
        ApplicationStatus status,
        String message,
        Instant createdAt,
        boolean cvAttached
) {
}