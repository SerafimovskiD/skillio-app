package mk.skillio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompanyProfileRequest(@NotBlank @Size(max = 200) String name,
                                    @Size(max = 2000) String description,
                                    @Size(max = 255) String website,
                                    @Size(max = 100) String industry,
                                    @Size(max = 100) String location) {
}
