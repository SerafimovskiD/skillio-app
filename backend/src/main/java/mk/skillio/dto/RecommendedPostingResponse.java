package mk.skillio.dto;

public record RecommendedPostingResponse(
        PostingResponse posting,
        double score,
        double similarity,
        SkillMatchResponse skillMatch,
        boolean categoryMatch
) {
}