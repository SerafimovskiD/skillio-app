package mk.skillio.service.impl;

import mk.skillio.dto.PostingSkillResponse;
import mk.skillio.dto.SkillMatchResponse;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class SkillMatcher {

    private static final double REQUIRED_WEIGHT = 1.0;
    private static final double OPTIONAL_WEIGHT = 0.5;

    public SkillMatchResponse match(Set<Long> studentSkillIds, List<PostingSkillResponse> postingSkills) {
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        double total = 0.0;
        double gained = 0.0;

        for (PostingSkillResponse skill : postingSkills) {
            double weight = Boolean.TRUE.equals(skill.required()) ? REQUIRED_WEIGHT : OPTIONAL_WEIGHT;
            total += weight;
            if (studentSkillIds.contains(skill.skillId())) {
                gained += weight;
                matched.add(skill.name());
            } else {
                missing.add(skill.name());
            }
        }

        double score = total == 0.0 ? 0.0 : Math.round((gained / total) * 1000.0) / 1000.0;
        return new SkillMatchResponse(matched, missing, score);
    }
}