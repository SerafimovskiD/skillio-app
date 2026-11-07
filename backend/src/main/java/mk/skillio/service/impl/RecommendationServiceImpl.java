package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.ai.ScoringWeights;
import mk.skillio.dto.CandidateResponse;
import mk.skillio.dto.PostingResponse;
import mk.skillio.dto.RecommendedPostingResponse;
import mk.skillio.dto.SkillMatchResponse;
import mk.skillio.enums.RecommendationMode;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.JobPosting;
import mk.skillio.model.User;
import mk.skillio.model.UserSkill;
import mk.skillio.repository.JobPostingRepository;
import mk.skillio.repository.ScoredId;
import mk.skillio.repository.UserInterestRepository;
import mk.skillio.repository.UserRepository;
import mk.skillio.repository.UserSkillRepository;
import mk.skillio.service.PostingService;
import mk.skillio.service.RecommendationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private static final int MAX_LIMIT = 50;
    private static final int SIMILARITY_POOL = 1000;

    private final UserRepository userRepository;
    private final JobPostingRepository postingRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserInterestRepository userInterestRepository;
    private final PostingService postingService;
    private final SkillMatcher skillMatcher;
    private final ScoringWeights scoringWeights;

    @Override
    @Transactional(readOnly = true)
    public List<RecommendedPostingResponse> recommendPostings(String studentEmail, int limit, RecommendationMode mode) {
        User user = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        boolean hasVector = user.getEmbedding() != null;

        Set<Long> skillIds = userSkillRepository.findAllByUserIdWithSkill(user.getId()).stream()
                .map(us -> us.getSkill().getId())
                .collect(Collectors.toSet());
        Set<Long> categoryIds = userInterestRepository.findAllByUserIdWithCategory(user.getId()).stream()
                .map(ui -> ui.getCategory().getId())
                .collect(Collectors.toSet());

        Map<Long, Double> similarity = hasVector
                ? postingRepository.findMostSimilarToStudent(user.getId(), SIMILARITY_POOL).stream()
                .filter(s -> s.getScore() != null)
                .collect(Collectors.toMap(ScoredId::getId, ScoredId::getScore))
                : Map.of();

        ScoringWeights.Weights w = scoringWeights.forMode(mode, hasVector);
        List<PostingResponse> postings = postingService.getByIds(postingRepository.findActiveIds());

        return postings.stream()
                .map(p -> {
                    double sim = clamp(similarity.getOrDefault(p.id(), 0.0));
                    SkillMatchResponse match = skillMatcher.match(skillIds, p.skills());
                    boolean categoryMatch = categoryIds.contains(p.categoryId());
                    double score = w.embedding() * sim
                            + w.skills() * match.score()
                            + w.category() * (categoryMatch ? 1.0 : 0.0);
                    return new RecommendedPostingResponse(p, round(score), round(sim), match, categoryMatch);
                })
                .sorted(Comparator.comparingDouble(RecommendedPostingResponse::score).reversed())
                .limit(safeLimit(limit))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CandidateResponse> findCandidates(String companyEmail, Long postingId, int limit, RecommendationMode mode) {
        if (!postingRepository.existsByIdAndCompanyUserEmail(postingId, companyEmail)) {
            throw new ResourceNotFoundException("Posting not found");
        }
        JobPosting posting = postingRepository.findById(postingId)
                .orElseThrow(() -> new ResourceNotFoundException("Posting not found"));
        PostingResponse postingDto = postingService.getByIds(List.of(postingId)).stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Posting not found"));
        boolean postingHasVector = posting.getEmbedding() != null;

        Map<Long, Double> similarity = postingHasVector
                ? userRepository.findMostSimilarToPosting(postingId, SIMILARITY_POOL).stream()
                .filter(s -> s.getScore() != null)
                .collect(Collectors.toMap(ScoredId::getId, ScoredId::getScore))
                : Map.of();

        List<Long> studentIds = userRepository.findStudentIds();
        if (studentIds.isEmpty()) {
            return List.of();
        }
        Map<Long, User> users = userRepository.findAllById(studentIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<Long, List<UserSkill>> skillsByUser = userSkillRepository.findAllByUserIdsWithSkill(studentIds).stream()
                .collect(Collectors.groupingBy(us -> us.getUser().getId()));
        Map<Long, Set<Long>> categoriesByUser = userInterestRepository.findAllByUserIdsWithCategory(studentIds).stream()
                .collect(Collectors.groupingBy(ui -> ui.getUser().getId(),
                        Collectors.mapping(ui -> ui.getCategory().getId(), Collectors.toSet())));

        List<CandidateResponse> result = new ArrayList<>();
        for (User u : users.values()) {
            List<UserSkill> userSkills = skillsByUser.getOrDefault(u.getId(), List.of());
            Set<Long> skillIds = userSkills.stream()
                    .map(us -> us.getSkill().getId())
                    .collect(Collectors.toSet());
            List<String> skillNames = userSkills.stream()
                    .map(us -> us.getSkill().getName())
                    .toList();

            boolean hasVector = postingHasVector && u.getEmbedding() != null;
            double sim = hasVector ? clamp(similarity.getOrDefault(u.getId(), 0.0)) : 0.0;
            SkillMatchResponse match = skillMatcher.match(skillIds, postingDto.skills());
            boolean categoryMatch = categoriesByUser.getOrDefault(u.getId(), Set.of())
                    .contains(postingDto.categoryId());

            ScoringWeights.Weights w = scoringWeights.forMode(mode, hasVector);
            double score = w.embedding() * sim
                    + w.skills() * match.score()
                    + w.category() * (categoryMatch ? 1.0 : 0.0);

            result.add(new CandidateResponse(u.getId(), u.getName(), u.getLocation(), u.getBio(),
                    skillNames, round(score), round(sim), match, categoryMatch));
        }

        return result.stream()
                .sorted(Comparator.comparingDouble(CandidateResponse::score).reversed())
                .limit(safeLimit(limit))
                .toList();
    }

    private int safeLimit(int limit) {
        return Math.min(Math.max(limit, 1), MAX_LIMIT);
    }

    private double clamp(double value) {
        return Math.max(0.0, Math.min(1.0, value));
    }

    private double round(Double value) {
        return value == null ? 0.0 : Math.round(value * 1000.0) / 1000.0;
    }
}