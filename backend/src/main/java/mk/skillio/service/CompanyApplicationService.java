package mk.skillio.service;

import mk.skillio.dto.CompanyApplicationResponse;
import mk.skillio.enums.ApplicationStatus;

import java.util.List;

public interface CompanyApplicationService {

    List<CompanyApplicationResponse> getPostingApplications(String companyEmail, Long postingId);

    CompanyApplicationResponse updateApplicationStatus(String companyEmail, Long applicationId, ApplicationStatus status);
}