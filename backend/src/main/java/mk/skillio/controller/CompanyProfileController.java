package mk.skillio.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.skillio.dto.CompanyProfileRequest;
import mk.skillio.dto.CompanyProfileResponse;
import mk.skillio.service.CompanyProfileService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/company/profile")
@RequiredArgsConstructor
public class CompanyProfileController {

    private final CompanyProfileService companyProfileService;

    @GetMapping
    public CompanyProfileResponse getProfile(Authentication authentication) {
        return companyProfileService.getProfile(authentication.getName());
    }

    @PutMapping
    public CompanyProfileResponse updateProfile(Authentication authentication,
                                                @Valid @RequestBody CompanyProfileRequest request) {
        return companyProfileService.updateProfile(authentication.getName(), request);
    }
}