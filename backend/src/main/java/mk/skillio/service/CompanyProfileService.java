package mk.skillio.service;

import mk.skillio.dto.CompanyProfileRequest;
import mk.skillio.dto.CompanyProfileResponse;

public interface CompanyProfileService {

    CompanyProfileResponse getProfile(String email);

    CompanyProfileResponse updateProfile(String email, CompanyProfileRequest request);
}