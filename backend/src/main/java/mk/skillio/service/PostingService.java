package mk.skillio.service;

import mk.skillio.dto.PostingRequest;
import mk.skillio.dto.PostingResponse;

import java.util.List;

public interface PostingService {

    PostingResponse create(String companyEmail, PostingRequest request);
    List<PostingResponse> getMyPostings(String companyEmail);
    PostingResponse getMyPostingById(String companyEmail, Long id);
    PostingResponse update(String companyEmail,Long id, PostingRequest request);
    void delete(String companyEmail,Long id);

    List<PostingResponse> getAll(Long categoryId);

    PostingResponse getById(Long id);

}
