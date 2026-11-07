package mk.skillio.controller;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.RecommendedPostingResponse;
import mk.skillio.enums.RecommendationMode;
import mk.skillio.service.RecommendationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/postings")
    public List<RecommendedPostingResponse> recommendedPostings(
            Authentication authentication,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "HYBRID") RecommendationMode mode) {
        return recommendationService.recommendPostings(authentication.getName(), limit, mode);
    }
}