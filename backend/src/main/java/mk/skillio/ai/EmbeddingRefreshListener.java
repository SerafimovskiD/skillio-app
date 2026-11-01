package mk.skillio.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class EmbeddingRefreshListener {

    private final EmbeddingService embeddingService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onRefresh(EmbeddingRefreshEvent event) {
        try{
            switch (event.type()){
                case STUDENT -> embeddingService.refreshStudent(event.id());
                case POSTING -> embeddingService.refreshPosting(event.id());
            }
        }catch (Exception e){
            log.warn("Could not refresh {} embedding for id {}: {}",
                    event.type(), event.id(), e.getMessage());
        }
    }
}
