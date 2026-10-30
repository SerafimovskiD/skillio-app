package mk.skillio.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.skillio.dto.PostingRequest;
import mk.skillio.dto.PostingResponse;
import mk.skillio.service.PostingService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company/postings")
@RequiredArgsConstructor
public class PostingController {

    private final PostingService postingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostingResponse create(Authentication authentication, @Valid @RequestBody PostingRequest request){
        return postingService.create(authentication.getName(),request);
    }

    @GetMapping
    public List<PostingResponse> getMyPostings(Authentication authentication){
        return postingService.getMyPostings(authentication.getName());
    }

    @GetMapping("/{id}")
    public PostingResponse getMyPostingById(Authentication authentication,  @PathVariable Long id){
        return postingService.getMyPostingById(authentication.getName(),id);
    }

    @PutMapping("/{id}")
    public PostingResponse update(Authentication authentication, @PathVariable Long id,
                                  @Valid @RequestBody PostingRequest request) {
        return postingService.update(authentication.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication authentication, @PathVariable Long id) {
        postingService.delete(authentication.getName(), id);
    }
}
