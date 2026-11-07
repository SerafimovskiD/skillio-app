package mk.skillio.service;

import mk.skillio.dto.CandidateResponse;
import mk.skillio.dto.RecommendedPostingResponse;
import mk.skillio.enums.RecommendationMode;

import java.util.List;

public interface RecommendationService {

    List<RecommendedPostingResponse> recommendPostings(String studentEmail, int limit, RecommendationMode mode);
    List<CandidateResponse> findCandidates(String companyEmail, Long postingId, int limit, RecommendationMode mode);
}
