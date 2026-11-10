package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.ApplicationRequest;
import mk.skillio.dto.ApplicationResponse;
import mk.skillio.enums.ApplicationStatus;
import mk.skillio.exception.BadRequestException;
import mk.skillio.exception.ConflictException;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.Application;
import mk.skillio.model.JobPosting;
import mk.skillio.model.User;
import mk.skillio.repository.ApplicationRepository;
import mk.skillio.repository.JobPostingRepository;
import mk.skillio.repository.UserRepository;
import mk.skillio.service.ApplicationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository postingRepository;
    private final UserRepository userRepository;


    @Override
    @Transactional
    public ApplicationResponse apply(String studentEmail, ApplicationRequest request) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(()->new ResourceNotFoundException("User not found"));
        JobPosting posting=postingRepository.findById(request.postingId())
                .orElseThrow(()->new ResourceNotFoundException("Posting not found"));
        if(posting.getDeadline() != null && posting.getDeadline().isBefore(LocalDate.now())) {
            throw new BadRequestException("Application deadline has passed");
        }
        if(applicationRepository.existsByUserEmailAndPostingId(studentEmail,posting.getId())) {
            throw new ConflictException("You have already applied to this posting");
        }
        Application application=new Application();
        application.setUser(user);
        application.setPosting(posting);
        application.setMessage(clean(request.message()));
        if (Boolean.TRUE.equals(request.attachCv())) {
            if (user.getCvStoredName() == null) {
                throw new BadRequestException("You have no CV uploaded in your profile");
            }
            application.setCvAttached(true);
        }
        applicationRepository.save(application);
        return toResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApplicationResponse> getMyApplications(String studentEmail) {
        return applicationRepository.findAllByUserEmail(studentEmail)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public void cancelMyApplication(String studentEmail, Long id) {
        Application application = applicationRepository.findByIdAndUserEmail(id, studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        if (application.getStatus() != ApplicationStatus.SENT) {
            throw new BadRequestException("Only applications with status SENT can be cancelled");
        }
        applicationRepository.delete(application);
    }

    private ApplicationResponse toResponse(Application application) {
        JobPosting posting = application.getPosting();
        return new ApplicationResponse(
                application.getId(),
                posting.getId(),
                posting.getTitle(),
                posting.getCompany().getName(),
                application.getStatus(),
                application.getMessage(),
                application.getCreatedAt(),
                application.isCvAttached());
    }
    private String clean(String message) {
        if (message == null || message.isBlank()) {
            return null;
        }
        return message.trim();
    }
}