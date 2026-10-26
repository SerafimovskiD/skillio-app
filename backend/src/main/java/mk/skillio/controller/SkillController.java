package mk.skillio.controller;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.SkillResponse;
import mk.skillio.service.SkillService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    public List<SkillResponse> getAll(){
        return skillService.geAll();
    }
}
