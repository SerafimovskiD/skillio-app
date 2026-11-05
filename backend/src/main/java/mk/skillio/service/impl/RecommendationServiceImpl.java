package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.dto.CandidateResponse;
import mk.skillio.dto.PostingResponse;
import mk.skillio.dto.RecommendedPostingResponse;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.JobPosting;
import mk.skillio.model.User;
import mk.skillio.repository.JobPostingRepository;
import mk.skillio.repository.ScoredId;
import mk.skillio.repository.UserRepository;
import mk.skillio.repository.UserSkillRepository;
import mk.skillio.service.PostingService;
import mk.skillio.service.RecommendationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private static final int MAX_LIMIT = 50;

    private final UserRepository userRepository;
    private final JobPostingRepository postingRepository;
    private final UserSkillRepository userSkillRepository;
    private final PostingService postingService;

    @Override
    @Transactional(readOnly = true)
    public List<RecommendedPostingResponse> recommendPostings(String studentEmail, int limit) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getEmbedding() == null) {
            return List.of();
        }

        List<ScoredId> scored = postingRepository.findMostSimilarToStudent(user.getId(), safeLimit(limit));
        List<Long> ids = scored.stream().map(ScoredId::getId).toList();
        Map<Long, PostingResponse> postings = postingService.getByIds(ids).stream()
                .collect(Collectors.toMap(PostingResponse::id, Function.identity()));

        return scored.stream()
                .filter(s -> postings.containsKey(s.getId()))
                .map(s -> new RecommendedPostingResponse(postings.get(s.getId()), round(s.getScore())))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CandidateResponse> findCandidates(String companyEmail, Long postingId, int limit) {
        if (!postingRepository.existsByIdAndCompanyUserEmail(postingId, companyEmail)) {
            throw new ResourceNotFoundException("Posting not found");
        }
        JobPosting posting = postingRepository.findById(postingId)
                .orElseThrow(() -> new ResourceNotFoundException("Posting not found"));
        if (posting.getEmbedding() == null) {
            return List.of();
        }

        List<ScoredId> scored = userRepository.findMostSimilarToPosting(postingId, safeLimit(limit));
        List<Long> ids = scored.stream().map(ScoredId::getId).toList();
        Map<Long, User> users = userRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        return scored.stream()
                .filter(s -> users.containsKey(s.getId()))
                .map(s -> {
                    User u = users.get(s.getId());
                    List<String> skills = userSkillRepository.findAllByUserIdWithSkill(u.getId()).stream()
                            .map(us -> us.getSkill().getName())
                            .toList();
                    return new CandidateResponse(u.getId(), u.getName(), u.getLocation(),
                            u.getBio(), skills, round(s.getScore()));
                })
                .toList();
    }

    private int safeLimit(int limit) {
        return Math.min(Math.max(limit, 1), MAX_LIMIT);
    }

    private double round(Double value) {
        return value == null ? 0.0 : Math.round(value * 1000.0) / 1000.0;
    }
}