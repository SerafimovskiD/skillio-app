package mk.skillio.controller;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.CandidateResponse;
import mk.skillio.service.RecommendationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/company/postings")
@RequiredArgsConstructor
public class CompanyCandidateController {

    private final RecommendationService recommendationService;

    @GetMapping("/{postingId}/candidates")
    public List<CandidateResponse> candidates(
            Authentication authentication,
            @PathVariable Long postingId,
            @RequestParam(defaultValue = "10") int limit) {
        return recommendationService.findCandidates(authentication.getName(), postingId, limit);
    }
}