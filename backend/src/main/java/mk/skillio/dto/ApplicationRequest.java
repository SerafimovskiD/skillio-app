package mk.skillio.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ApplicationRequest(@NotNull Long postingId, @Size(max = 5000) String message) {
}
