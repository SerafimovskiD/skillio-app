package mk.skillio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record EducationRequest(@NotBlank @Size(max = 200) String institution,
                               @Size(max = 200) String degree,
                               LocalDate startDate,
                               LocalDate endDate) {
}
