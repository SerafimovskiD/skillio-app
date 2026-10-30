package mk.skillio.service;

import mk.skillio.dto.SavedPostingResponse;

import java.util.List;

public interface SavedPostingService {

    SavedPostingResponse savePosting(String studentEmail, Long postingId);

    List<SavedPostingResponse> getMySavedPostings(String studentEmail);

    void removeSavedPosting(String studentEmail, Long postingId);
}