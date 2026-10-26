package mk.skillio.dto;

import mk.skillio.enums.SkillLevel;

public record UserSkillResponse(Long skillId, String name, String category, SkillLevel level) {
}
