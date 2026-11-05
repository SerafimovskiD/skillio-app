package mk.skillio.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.skillio.exception.EmbeddingUnavailableException;
import mk.skillio.repository.JobPostingRepository;
import mk.skillio.repository.UserRepository;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmbeddingBackfill {

    private final JobPostingRepository postingRepository;
    private final UserRepository userRepository;
    private final EmbeddingService embeddingService;

    @Async
    @EventListener(ApplicationReadyEvent.class)
    public void backfillMissingEmbeddings() {
        List<Long> postingIds = postingRepository.findIdsWithoutEmbedding();
        List<Long> studentIds = userRepository.findStudentIdsWithoutEmbedding();
        if (postingIds.isEmpty() && studentIds.isEmpty()) {
            return;
        }
        log.info("Backfilling embeddings: {} postings, {} students", postingIds.size(), studentIds.size());

        try {
            for (Long id : postingIds) {
                embeddingService.refreshPosting(id);
            }
            for (Long id : studentIds) {
                embeddingService.refreshStudent(id);
            }
            log.info("Embedding backfill finished");
        } catch (EmbeddingUnavailableException e) {
            log.warn("Embedding backfill stopped, AI service unavailable: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("Embedding backfill failed: {}", e.getMessage());
        }
    }
}