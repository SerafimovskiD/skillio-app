package mk.skillio.service;

import mk.skillio.dto.UserSkillResponse;
import mk.skillio.enums.SkillLevel;

import java.util.List;

public interface UserSkillService {

    List<UserSkillResponse> getMySkills(String email);
    UserSkillResponse setSkill(String email, Long skillId, SkillLevel level);
    void removeSkill(String email, Long skillId);
}
