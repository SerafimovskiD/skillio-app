package mk.skillio.service.impl;

import lombok.RequiredArgsConstructor;
import mk.skillio.ai.EmbeddingRefreshEvent;
import mk.skillio.dto.PostingRequest;
import mk.skillio.dto.PostingResponse;
import mk.skillio.dto.PostingSkillRequest;
import mk.skillio.dto.PostingSkillResponse;
import mk.skillio.exception.BadRequestException;
import mk.skillio.exception.ResourceNotFoundException;
import mk.skillio.model.*;
import mk.skillio.repository.*;
import mk.skillio.service.PostingService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostingServiceImpl implements PostingService {

    private final JobPostingRepository postingRepository;
    private final PostingSkillRepository postingSkillRepository;
    private final CompanyRepository companyRepository;
    private final CategoryRepository categoryRepository;
    private final SkillRepository skillRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public PostingResponse create(String companyEmail, PostingRequest request) {
        Company company = findCompany(companyEmail);
        Category category = findCategory(request.categoryId());

        JobPosting posting = new JobPosting();
        posting.setCompany(company);
        applyFields(posting, request, category);
        postingRepository.save(posting);

        saveSkills(posting, request.skills());
        eventPublisher.publishEvent(EmbeddingRefreshEvent.posting(posting.getId()));
        return toResponse(posting);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostingResponse> getMyPostings(String companyEmail) {
        Company company = findCompany(companyEmail);
        return postingRepository.findAllByCompanyId(company.getId())
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PostingResponse getMyPostingById(String companyEmail, Long id) {
        return toResponse(findMyPosting(companyEmail, id));
    }

    @Override
    @Transactional
    public PostingResponse update(String companyEmail, Long id, PostingRequest request) {
        JobPosting posting = findMyPosting(companyEmail, id);
        Category category = findCategory(request.categoryId());

        applyFields(posting, request, category);
        postingRepository.save(posting);

        postingSkillRepository.deleteAllByPostingId(posting.getId());
        saveSkills(posting, request.skills());
        eventPublisher.publishEvent(EmbeddingRefreshEvent.posting(posting.getId()));
        return toResponse(posting);
    }

    @Override
    @Transactional
    public void delete(String companyEmail, Long id) {
        JobPosting posting = findMyPosting(companyEmail, id);
        postingSkillRepository.deleteAllByPostingId(posting.getId());
        postingRepository.delete(posting);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostingResponse> getAll(Long categoryId) {
        List<JobPosting> postings = categoryId == null
                ? postingRepository.findAllWithDetails()
                : postingRepository.findAllByCategoryId(categoryId);
        return toResponses(postings);
    }

    @Override
    @Transactional(readOnly = true)
    public PostingResponse getById(Long id) {
        JobPosting posting = postingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("Posting not found"));
        return toResponse(posting);
    }

    private Company findCompany(String email) {
        return companyRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
    }

    private Category findCategory(Long categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new BadRequestException("Category does not exist"));
    }

    private JobPosting findMyPosting(String companyEmail, Long id) {
        Company company = findCompany(companyEmail);
        return postingRepository.findByIdAndCompanyId(id, company.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Posting not found"));
    }

    private void applyFields(JobPosting posting, PostingRequest request, Category category) {
        posting.setTitle(request.title().trim());
        posting.setDescription(request.description().trim());
        posting.setType(request.type());
        posting.setLocation(request.location());
        posting.setCategory(category);
        posting.setDeadline(request.deadline());
    }

    private void saveSkills(JobPosting posting, List<PostingSkillRequest> skills) {
        if (skills == null) {
            return;
        }
        Set<Long> seen = new HashSet<>();
        for (PostingSkillRequest item : skills) {
            if (!seen.add(item.skillId())) {
                throw new BadRequestException("Skill is listed more than once");
            }
            Skill skill = skillRepository.findById(item.skillId())
                    .orElseThrow(() -> new BadRequestException("Skill does not exist: " + item.skillId()));
            PostingSkill postingSkill = new PostingSkill();
            postingSkill.setPosting(posting);
            postingSkill.setSkill(skill);
            postingSkill.setRequired(item.required() == null || item.required());
            postingSkillRepository.save(postingSkill);
        }
    }

    private PostingResponse toResponse(JobPosting posting) {
        List<PostingSkillResponse> skills = postingSkillRepository
                .findAllByPostingIds(List.of(posting.getId()))
                .stream()
                .map(ps -> new PostingSkillResponse(ps.getSkill().getId(), ps.getSkill().getName(), ps.isRequired()))
                .toList();
        return new PostingResponse(
                posting.getId(),
                posting.getCompany().getId(),
                posting.getCompany().getName(),
                posting.getTitle(),
                posting.getDescription(),
                posting.getType(),
                posting.getLocation(),
                posting.getCategory().getId(),
                posting.getCategory().getName(),
                posting.getDeadline(),
                posting.getCreatedAt(),
                skills);
    }

    private List<PostingResponse> toResponses(List<JobPosting> postings) {
        if (postings.isEmpty()) {
            return List.of();
        }
        List<Long> ids = postings.stream().map(JobPosting::getId).toList();
        Map<Long, List<PostingSkillResponse>> skillsByPosting = postingSkillRepository
                .findAllByPostingIds(ids)
                .stream()
                .collect(Collectors.groupingBy(
                        ps -> ps.getPosting().getId(),
                        Collectors.mapping(
                                ps -> new PostingSkillResponse(ps.getSkill().getId(), ps.getSkill().getName(), ps.isRequired()),
                                Collectors.toList())));
        return postings.stream()
                .map(p -> new PostingResponse(
                        p.getId(),
                        p.getCompany().getId(),
                        p.getCompany().getName(),
                        p.getTitle(),
                        p.getDescription(),
                        p.getType(),
                        p.getLocation(),
                        p.getCategory().getId(),
                        p.getCategory().getName(),
                        p.getDeadline(),
                        p.getCreatedAt(),
                        skillsByPosting.getOrDefault(p.getId(), List.of())))
                .toList();
    }
}