package mk.skillio.service;

import mk.skillio.dto.CandidateResponse;
import mk.skillio.dto.RecommendedPostingResponse;

import java.util.List;

public interface RecommendationService {

    List<RecommendedPostingResponse> recommendPostings(String studentEmail, int limit);

    List<CandidateResponse> findCandidates(String companyEmail, Long postingId, int limit);
}
