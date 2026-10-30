package mk.skillio.dto;

import mk.skillio.enums.PostingType;

import java.time.Instant;
import java.time.LocalDate;

public record SavedPostingResponse(
        Long postingId,
        String title,
        String companyName,
        String categoryName,
        PostingType type,
        String location,
        LocalDate deadline,
        Instant savedAt
) {
}