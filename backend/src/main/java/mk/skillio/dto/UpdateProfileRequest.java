package mk.skillio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(@NotBlank @Size(max = 100) String name, @NotBlank @Size(max = 100)  String location,@Size(max = 2000) String bio) {
}
