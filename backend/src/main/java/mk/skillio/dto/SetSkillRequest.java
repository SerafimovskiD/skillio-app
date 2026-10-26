package mk.skillio.dto;

import jakarta.validation.constraints.NotNull;
import mk.skillio.enums.SkillLevel;

public record SetSkillRequest(@NotNull SkillLevel level) {
}
