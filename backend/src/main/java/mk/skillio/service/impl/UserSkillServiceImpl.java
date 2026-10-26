package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.UserSkillResponse;
import mk.skillio.enums.SkillLevel;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.Skill;
import mk.skillio.model.User;
import mk.skillio.model.UserSkill;
import mk.skillio.repository.SkillRepository;
import mk.skillio.repository.UserRepository;
import mk.skillio.repository.UserSkillRepository;
import mk.skillio.service.UserSkillService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
@Service
@RequiredArgsConstructor
public class UserSkillServiceImpl implements UserSkillService {

    private final UserSkillRepository userSkillRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserSkillResponse> getMySkills(String email) {
        User user = findUser(email);
        return userSkillRepository.findAllByUserIdWithSkill(user.getId()).stream().map(this:: toResponse).toList();

    }
    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserSkillResponse toResponse(UserSkill us) {
        return new UserSkillResponse(
                us.getSkill().getId(),
                us.getSkill().getName(),
                us.getSkill().getCategory().getName(),
                us.getLevel()
        );
    }
    @Override
    @Transactional
    public UserSkillResponse setSkill(String email, Long skillId, SkillLevel level) {
        User user = findUser(email);
        Skill skill= skillRepository.findById(skillId).orElseThrow(()-> new ResourceNotFoundException("Skill not found"));

        UserSkill userSkill = userSkillRepository.findByUserIdAndSkillId(user.getId(),skillId).orElseGet(()->{
            UserSkill created = new UserSkill();
            created.setUser(user);
            created.setSkill(skill);
            return created;
        });
        userSkill.setLevel(level);
        userSkillRepository.save(userSkill);
        return toResponse(userSkill);
    }

    @Override
    @Transactional
    public void removeSkill(String email, Long skillId) {
        User user = findUser(email);
        UserSkill userSkill = userSkillRepository.findByUserIdAndSkillId(user.getId(),skillId).orElseThrow(()->new ResourceNotFoundException("Skill is not in your profile"));
        userSkillRepository.delete(userSkill);
    }
}
