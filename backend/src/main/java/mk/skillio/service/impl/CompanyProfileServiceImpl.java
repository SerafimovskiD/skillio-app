package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.CompanyProfileRequest;
import mk.skillio.dto.CompanyProfileResponse;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.Company;
import mk.skillio.repository.CompanyRepository;
import mk.skillio.service.CompanyProfileService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CompanyProfileServiceImpl implements CompanyProfileService {

    private final CompanyRepository companyRepository;

    @Override
    @Transactional(readOnly = true)
    public CompanyProfileResponse getProfile(String email) {
        return toResponse(findCompany(email));
    }

    @Override
    @Transactional
    public CompanyProfileResponse updateProfile(String email, CompanyProfileRequest request) {
        Company company = findCompany(email);
        company.setName(request.name().trim());
        company.setDescription(request.description());
        company.setWebsite(request.website());
        company.setIndustry(request.industry());
        company.setLocation(request.location());
        return toResponse(company);
    }

    private Company findCompany(String email) {
        return companyRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not found"));
    }

    private CompanyProfileResponse toResponse(Company company) {
        return new CompanyProfileResponse(
                company.getId(),
                company.getName(),
                company.getDescription(),
                company.getWebsite(),
                company.getIndustry(),
                company.getLocation()
        );
    }
}
