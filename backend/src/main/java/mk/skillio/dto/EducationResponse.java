package mk.skillio.dto;

import java.time.LocalDate;

public record EducationResponse(Long id,
                                String institution,
                                String degree,
                                LocalDate startDate,
                                LocalDate endDate) {

}
