package mk.skillio.service;

import mk.skillio.dto.CompanyApplicationResponse;
import mk.skillio.dto.CvFile;
import mk.skillio.enums.ApplicationStatus;

import java.util.List;

public interface CompanyApplicationService {

    List<CompanyApplicationResponse> getPostingApplications(String companyEmail, Long postingId);

    CompanyApplicationResponse updateApplicationStatus(String companyEmail, Long applicationId, ApplicationStatus status);


    CvFile getApplicantCv(String companyEmail, Long applicationId);
}