package mk.skillio.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.skillio.dto.ProfileResponse;
import mk.skillio.dto.UpdateProfileRequest;
import mk.skillio.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ProfileResponse getProfile(Authentication authentication) {
        return userService.getProfile(authentication.getName());
    }
    @PutMapping
    public ProfileResponse updateProfile(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request){
        return userService.updateProfile(authentication.getName(), request);
    }
}