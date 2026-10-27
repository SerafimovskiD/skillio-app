package mk.skillio.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.skillio.dto.EducationRequest;
import mk.skillio.dto.EducationResponse;
import mk.skillio.model.Education;
import mk.skillio.service.EducationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profile/education")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService educationService;
    @GetMapping
    public List<EducationResponse> getMyEducation(Authentication authentication) {
        return educationService.getMyEducation(authentication.getName());
    }
    @PostMapping
    public ResponseEntity<EducationResponse>create(Authentication authentication, @Valid @RequestBody EducationRequest request){
        EducationResponse response=educationService.create(authentication.getName(),request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @PutMapping("/{educationId}")
    public EducationResponse update(Authentication authentication,
                                    @PathVariable Long educationId,
                                    @Valid @RequestBody EducationRequest request) {
        return educationService.update(authentication.getName(), educationId, request);
    }

    @DeleteMapping("/{educationId}")
    public ResponseEntity<Void> delete(Authentication authentication,
                                       @PathVariable Long educationId) {
        educationService.delete(authentication.getName(), educationId);
        return ResponseEntity.noContent().build();
    }

}
