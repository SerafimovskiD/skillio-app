package mk.skillio.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import mk.skillio.enums.PostingType;

import java.time.LocalDate;
import java.util.List;

public record PostingRequest(
                             @NotBlank @Size(max = 255) String title,
                             @NotBlank String description,
                             @NotNull PostingType type,
                             @Size(max = 255) String location,
                             @NotNull Long categoryId,
                             LocalDate deadline,
                             @Valid List<PostingSkillRequest> skills
){

}
