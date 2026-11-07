package mk.skillio.dto;

import java.util.List;

public record CandidateResponse(Long userId,
                                String name,
                                String location,
                                String bio,
                                List<String> skills,
                                double score,
                                double similarity,
                                SkillMatchResponse skillMatch,
                                boolean categoryMatch) {
}