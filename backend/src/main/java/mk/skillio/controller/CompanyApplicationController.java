package mk.skillio.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.skillio.dto.CompanyApplicationResponse;
import mk.skillio.dto.UpdateApplicationStatusRequest;
import mk.skillio.service.CompanyApplicationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
public class CompanyApplicationController {

    private final CompanyApplicationService companyApplicationService;

    @GetMapping("/postings/{postingId}/applications")
    public List<CompanyApplicationResponse> getPostingApplications(Authentication authentication,
                                                                   @PathVariable Long postingId) {
        return companyApplicationService.getPostingApplications(authentication.getName(), postingId);
    }

    @PutMapping("/applications/{id}/status")
    public CompanyApplicationResponse updateApplicationStatus(Authentication authentication,
                                                              @PathVariable Long id,
                                                              @Valid @RequestBody UpdateApplicationStatusRequest request) {
        return companyApplicationService.updateApplicationStatus(authentication.getName(), id, request.status());
    }
}