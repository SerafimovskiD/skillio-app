package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.SkillResponse;
import mk.skillio.repository.SkillRepository;
import mk.skillio.service.SkillService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor

public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SkillResponse> geAll() {
        return skillRepository.findAllWithCategory().stream()
                .map(s-> new SkillResponse(s.getId(),s.getName(),s.getCategory().getName()))
                .toList();
    }
}
