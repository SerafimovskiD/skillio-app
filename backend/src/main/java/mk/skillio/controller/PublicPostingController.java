package mk.skillio.controller;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.PostingResponse;
import mk.skillio.service.PostingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/postings")
@RequiredArgsConstructor
public class PublicPostingController {

    private final PostingService postingService;

    @GetMapping
    public List<PostingResponse> getAll(@RequestParam(required = false)Long categoryId) {
        return postingService.getAll(categoryId);
    }
    @GetMapping("/{id}")
    public PostingResponse getById(@PathVariable Long id) {
        return postingService.getById(id);
    }


}
