package mk.skillio.controller;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.SavedPostingResponse;
import mk.skillio.service.SavedPostingService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-postings")
@RequiredArgsConstructor
public class SavedPostingController {

    private final SavedPostingService savedPostingService;

    @PutMapping("/{postingId}")
    public SavedPostingResponse savePosting(Authentication authentication, @PathVariable Long postingId) {
        return savedPostingService.savePosting(authentication.getName(), postingId);
    }

    @GetMapping
    public List<SavedPostingResponse> getMySavedPostings(Authentication authentication) {
        return savedPostingService.getMySavedPostings(authentication.getName());
    }

    @DeleteMapping("/{postingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeSavedPosting(Authentication authentication, @PathVariable Long postingId) {
        savedPostingService.removeSavedPosting(authentication.getName(), postingId);
    }
}