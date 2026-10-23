package mk.skillio.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import mk.skillio.enums.Role;

public record RegisterRequest(@NotBlank @Email String email,
                              @NotBlank @Size(min = 8, message = "must be at 8 characters") String password,
                              @NotBlank String name,
                              @NotNull Role role,
                              String companyName
) {
}
