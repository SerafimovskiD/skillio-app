package mk.skillio.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.skillio.dto.ApplicationRequest;
import mk.skillio.dto.ApplicationResponse;
import mk.skillio.service.ApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse apply(Authentication authentication, @Valid @RequestBody ApplicationRequest request) {
        return applicationService.apply(authentication.getName(), request);
    }

    @GetMapping
    public List<ApplicationResponse> getMyApplications(Authentication authentication) {
        return applicationService.getMyApplications(authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelMyApplication(Authentication authentication, @PathVariable Long id) {
        applicationService.cancelMyApplication(authentication.getName(), id);
    }
}