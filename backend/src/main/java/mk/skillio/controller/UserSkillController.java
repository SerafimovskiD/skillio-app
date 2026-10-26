package mk.skillio.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import mk.skillio.dto.SetSkillRequest;
import mk.skillio.dto.UserSkillResponse;
import mk.skillio.service.UserSkillService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/profile/skills")
@RequiredArgsConstructor
public class UserSkillController {

    private final UserSkillService userSkillService;

    @GetMapping
    public List<UserSkillResponse> getMySkills(Authentication authentication) {
        return userSkillService.getMySkills(authentication.getName());
    }

    @PutMapping("/{skillId}")
    public UserSkillResponse setSkill(Authentication authentication,
                                      @PathVariable Long skillId,
                                      @Valid @RequestBody SetSkillRequest request) {
        return userSkillService.setSkill(authentication.getName(), skillId, request.level());
    }

    @DeleteMapping("/{skillId}")
    public ResponseEntity<Void> removeSkill(Authentication authentication,
                                            @PathVariable Long skillId) {
        userSkillService.removeSkill(authentication.getName(), skillId);
        return ResponseEntity.noContent().build();
    }
}