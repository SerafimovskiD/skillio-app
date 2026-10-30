package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.SavedPostingResponse;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.JobPosting;
import mk.skillio.model.SavedPosting;
import mk.skillio.model.User;
import mk.skillio.repository.JobPostingRepository;
import mk.skillio.repository.SavedPostingRepository;
import mk.skillio.repository.UserRepository;
import mk.skillio.service.SavedPostingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedPostingServiceImpl implements SavedPostingService {

    private final SavedPostingRepository savedPostingRepository;
    private final JobPostingRepository postingRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public SavedPostingResponse savePosting(String studentEmail, Long postingId) {
        SavedPosting existing = savedPostingRepository
                .findByUserEmailAndPostingId(studentEmail, postingId)
                .orElse(null);
        if (existing != null) {
            return toResponse(existing);
        }

        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        JobPosting posting = postingRepository.findById(postingId)
                .orElseThrow(() -> new ResourceNotFoundException("Posting not found"));

        SavedPosting saved = new SavedPosting();
        saved.setUser(user);
        saved.setPosting(posting);
        savedPostingRepository.save(saved);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SavedPostingResponse> getMySavedPostings(String studentEmail) {
        return savedPostingRepository.findAllByUserEmail(studentEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void removeSavedPosting(String studentEmail, Long postingId) {
        SavedPosting saved = savedPostingRepository
                .findByUserEmailAndPostingId(studentEmail, postingId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved posting not found"));
        savedPostingRepository.delete(saved);
    }

    private SavedPostingResponse toResponse(SavedPosting saved) {
        JobPosting posting = saved.getPosting();
        return new SavedPostingResponse(
                posting.getId(),
                posting.getTitle(),
                posting.getCompany().getName(),
                posting.getCategory().getName(),
                posting.getType(),
                posting.getLocation(),
                posting.getDeadline(),
                saved.getSavedAt());
    }
}