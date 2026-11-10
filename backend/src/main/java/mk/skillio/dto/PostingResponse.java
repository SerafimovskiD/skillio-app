package mk.skillio.dto;

import mk.skillio.enums.PostingType;
import mk.skillio.enums.WorkMode;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record PostingResponse(
        Long id,
        Long companyId,
        String companyName,
        String title,
        String description,
        PostingType type,
        WorkMode workMode,
        String location,
        Long categoryId,
        String categoryName,
        LocalDate deadline,
        Instant createdAt,
        List<PostingSkillResponse> skills
) {
}