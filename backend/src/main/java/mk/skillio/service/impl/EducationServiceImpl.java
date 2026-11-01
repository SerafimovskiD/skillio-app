package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.ai.EmbeddingRefreshEvent;
import mk.skillio.dto.EducationRequest;
import mk.skillio.dto.EducationResponse;
import mk.skillio.exception.BadRequestException;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.Education;
import mk.skillio.model.User;
import mk.skillio.repository.EducationRepository;
import mk.skillio.repository.UserRepository;
import mk.skillio.service.EducationService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EducationServiceImpl implements EducationService {

    private final UserRepository userRepository;
    private final EducationRepository educationRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<EducationResponse> getMyEducation(String email) {
        User user = findUser(email);
        return educationRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public EducationResponse create(String email, EducationRequest request) {
        User user = findUser(email);
        Education education = new Education();
        education.setUser(user);
        apply(education, request);
        Education saved = educationRepository.save(education);
        eventPublisher.publishEvent(EmbeddingRefreshEvent.student(user.getId()));
        return toResponse(saved);
    }

    @Override
    @Transactional
    public EducationResponse update(String email, Long educationId, EducationRequest request) {
        Education education = findOwnedEducation(email, educationId);
        apply(education, request);
        eventPublisher.publishEvent(EmbeddingRefreshEvent.student(education.getUser().getId()));
        return toResponse(education);
    }

    @Override
    @Transactional
    public void delete(String email, Long educationId) {
        Education education = findOwnedEducation(email, educationId);
        Long userId = education.getUser().getId();
        educationRepository.delete(education);
        eventPublisher.publishEvent(EmbeddingRefreshEvent.student(userId));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Education findOwnedEducation(String email, Long educationId) {
        User user = findUser(email);
        return educationRepository.findByIdAndUserId(educationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Education not found"));
    }

    private void apply(Education education, EducationRequest request) {
        if (request.startDate() != null && request.endDate() != null
                && request.endDate().isBefore(request.startDate())) {
            throw new BadRequestException("End date cannot be before start date");
        }
        education.setInstitution(request.institution().trim());
        education.setDegree(request.degree());
        education.setStartDate(request.startDate());
        education.setEndDate(request.endDate());
    }

    private EducationResponse toResponse(Education education) {
        return new EducationResponse(
                education.getId(),
                education.getInstitution(),
                education.getDegree(),
                education.getStartDate(),
                education.getEndDate()
        );
    }
}