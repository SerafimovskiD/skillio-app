package mk.skillio.service;

import mk.skillio.dto.EducationRequest;
import mk.skillio.dto.EducationResponse;

import java.util.List;

public interface EducationService {

    List<EducationResponse> getMyEducation(String email);
    EducationResponse create(String email, EducationRequest request);
    EducationResponse update(String email,Long educationId,EducationRequest request);
    void delete(String email,Long educationId);


}
