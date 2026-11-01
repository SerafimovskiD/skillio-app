package mk.skillio.ai;

import lombok.RequiredArgsConstructor;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.JobPosting;
import mk.skillio.model.User;
import mk.skillio.repository.JobPostingRepository;
import mk.skillio.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmbeddingService {

    private final EmbeddingTextBuilder textBuilder;
    private final AiClient aiClient;
    private final UserRepository userRepository;
    private final JobPostingRepository postingRepository;

    @Transactional
    public void refreshStudent(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String text = textBuilder.forStudent(user);
        if (text == null || text.isBlank()) {
            user.setEmbedding(null);
            return;
        }
        user.setEmbedding(aiClient.embed(text));
    }

    @Transactional
    public void refreshPosting(Long postingId) {
        JobPosting posting = postingRepository.findByIdWithDetails(postingId)
                .orElseThrow(() -> new ResourceNotFoundException("Posting not found"));
        String text = textBuilder.forPosting(posting);
        if (text == null || text.isBlank()) {
            posting.setEmbedding(null);
            return;
        }
        posting.setEmbedding(aiClient.embed(text));
    }
}