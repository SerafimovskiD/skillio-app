package mk.skillio.dto;

import jakarta.validation.constraints.NotNull;
import mk.skillio.enums.ApplicationStatus;

public record UpdateApplicationStatusRequest(@NotNull ApplicationStatus status) {
}