package mk.skillio.dto;

import mk.skillio.enums.SkillLevel;

public record ApplicantSkillResponse(Long skillId, String name, SkillLevel level) {
}