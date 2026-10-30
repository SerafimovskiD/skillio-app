package mk.skillio.dto;

import jakarta.validation.constraints.NotNull;

public record PostingSkillRequest(@NotNull Long skillId, Boolean required) {
}
