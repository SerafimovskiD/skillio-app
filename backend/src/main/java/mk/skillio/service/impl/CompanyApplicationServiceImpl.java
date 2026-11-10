package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.ApplicantSkillResponse;
import mk.skillio.dto.CompanyApplicationResponse;
import mk.skillio.dto.CvFile;
import mk.skillio.enums.ApplicationStatus;
import mk.skillio.exception.BadRequestException;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.Application;
import mk.skillio.model.User;
import mk.skillio.repository.ApplicationRepository;
import mk.skillio.repository.JobPostingRepository;
import mk.skillio.repository.UserSkillRepository;
import mk.skillio.service.CompanyApplicationService;
import mk.skillio.service.CvService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyApplicationServiceImpl implements CompanyApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository postingRepository;
    private final UserSkillRepository userSkillRepository;
    private final CvService cvService;

    @Override
    @Transactional(readOnly = true)
    public List<CompanyApplicationResponse> getPostingApplications(String companyEmail, Long postingId) {
        if (!postingRepository.existsByIdAndCompanyUserEmail(postingId, companyEmail)) {
            throw new ResourceNotFoundException("Posting not found");
        }
        return applicationRepository.findAllByPostingId(postingId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CompanyApplicationResponse updateApplicationStatus(String companyEmail, Long applicationId,
                                                              ApplicationStatus status) {
        if (status == ApplicationStatus.SENT) {
            throw new BadRequestException("Status cannot be set back to SENT");
        }
        Application application = applicationRepository
                .findByIdAndPostingCompanyUserEmail(applicationId, companyEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        application.setStatus(status);
        applicationRepository.save(application);
        return toResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public CvFile getApplicantCv(String companyEmail, Long applicationId) {
        Application application = applicationRepository
                .findByIdAndPostingCompanyUserEmail(applicationId, companyEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        if (!application.isCvAttached()) {
            throw new ResourceNotFoundException("CV not found");
        }
        return cvService.loadFile(application.getUser());
    }

    private CompanyApplicationResponse toResponse(Application application) {
        User student = application.getUser();
        List<ApplicantSkillResponse> skills = userSkillRepository.findAllByUserIdWithSkill(student.getId())
                .stream()
                .map(us -> new ApplicantSkillResponse(us.getSkill().getId(), us.getSkill().getName(), us.getLevel()))
                .toList();
        return new CompanyApplicationResponse(
                application.getId(),
                application.getStatus(),
                application.getMessage(),
                application.getCreatedAt(),
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getLocation(),
                student.getBio(),
                skills,
                application.isCvAttached() && student.getCvStoredName() != null);
    }
}