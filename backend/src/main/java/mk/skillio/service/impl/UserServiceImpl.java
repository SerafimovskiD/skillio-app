package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.ProfileResponse;
import mk.skillio.dto.UpdateProfileRequest;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.User;
import mk.skillio.repository.UserRepository;
import mk.skillio.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import mk.skillio.ai.EmbeddingRefreshEvent;
import org.springframework.context.ApplicationEventPublisher;
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;


    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String email) {
        return toResponse(findByEmail(email));
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(()->new ResourceNotFoundException("User not found"));
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
       User user = findByEmail(email);
       user.setName(request.name().trim());
       user.setLocation(request.location());
       user.setBio(request.bio());
       eventPublisher.publishEvent(EmbeddingRefreshEvent.student(user.getId()));
       return toResponse(user);
    }

    private ProfileResponse toResponse(User user) {
        return new ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getLocation(),
                user.getBio()
        );
    }
}
