package mk.skillio.dto;

import java.util.List;

public record SkillMatchResponse(List<String>matched,
                                 List<String> missing,
                                 double score
) {
}
