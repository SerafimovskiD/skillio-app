package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.InterestResponse;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.Category;
import mk.skillio.model.User;
import mk.skillio.model.UserInterest;
import mk.skillio.repository.CategoryRepository;
import mk.skillio.repository.UserInterestRepository;
import mk.skillio.repository.UserRepository;
import mk.skillio.service.UserInterestService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import mk.skillio.ai.EmbeddingRefreshEvent;
import org.springframework.context.ApplicationEventPublisher;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserInterestServiceImpl implements UserInterestService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final UserInterestRepository userInterestRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public List<InterestResponse> getMyInterests(String email) {
        User user = findUser(email);
        return userInterestRepository.findAllByUserIdWithCategory(user.getId()).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public InterestResponse addInterest(String email, Long categoryId) {
        User user = findUser(email);
        Category category = categoryRepository.findById(categoryId).orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        UserInterest interest = userInterestRepository.findByUserIdAndCategoryId(user.getId(), categoryId)
                .orElseGet(() -> {
                    UserInterest created = new UserInterest();
                    created.setUser(user);
                    created.setCategory(category);
                    return userInterestRepository.save(created);
                });
        eventPublisher.publishEvent(EmbeddingRefreshEvent.student(user.getId()));
        return toResponse(interest);
    }

    @Override
    @Transactional
    public void removeInterest(String email, Long categoryId) {
        User user = findUser(email);
        UserInterest interest=userInterestRepository.findByUserIdAndCategoryId(user.getId(),categoryId)
                .orElseThrow(()->new ResourceNotFoundException("Interest is not in your profile"));
        userInterestRepository.delete(interest);
        eventPublisher.publishEvent(EmbeddingRefreshEvent.student(user.getId()));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private InterestResponse toResponse(UserInterest interest) {
        return new InterestResponse(
                interest.getCategory().getId(),
                interest.getCategory().getName()
        );
    }
}
