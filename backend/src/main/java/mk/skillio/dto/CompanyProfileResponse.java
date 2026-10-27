package mk.skillio.dto;

public record CompanyProfileResponse(
        Long id,
        String name,
        String description,
        String website,
        String industry,
        String location
) {
}