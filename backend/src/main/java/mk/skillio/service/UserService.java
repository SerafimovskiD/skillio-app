package mk.skillio.service;

import mk.skillio.dto.ProfileResponse;
import mk.skillio.dto.UpdateProfileRequest;

public interface UserService {

    ProfileResponse getProfile(String email);
    ProfileResponse updateProfile(String email, UpdateProfileRequest request);
}
