package mk.skillio.controller;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.InterestResponse;
import mk.skillio.service.UserInterestService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile/interests")
@RequiredArgsConstructor
public class UserInterestController {

    private final UserInterestService userInterestService;

    @GetMapping
    public List<InterestResponse> getMyInterests(Authentication authentication){
        return userInterestService.getMyInterests(authentication.getName());
    }
    @PutMapping("/{categoryId}")
    public InterestResponse addInterest(Authentication authentication, @PathVariable Long categoryId) {
        return userInterestService.addInterest(authentication.getName(),categoryId);
    }
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> removeInterest(Authentication authentication, @PathVariable Long categoryId) {
        userInterestService.removeInterest(authentication.getName(),categoryId);
        return ResponseEntity.noContent().build();
    }
}
