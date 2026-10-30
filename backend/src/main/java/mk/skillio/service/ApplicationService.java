package mk.skillio.service;

import mk.skillio.dto.ApplicationRequest;
import mk.skillio.dto.ApplicationResponse;

import java.util.List;

public interface ApplicationService {

    ApplicationResponse apply(String studentEmail, ApplicationRequest request);
    List<ApplicationResponse> getMyApplications(String studentEmail);
    void cancelMyApplication(String studentEmail, Long id);
}
