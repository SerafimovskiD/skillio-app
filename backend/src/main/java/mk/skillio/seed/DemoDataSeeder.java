package mk.skillio.seed;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.skillio.ai.EmbeddingService;
import mk.skillio.dto.CompanyProfileRequest;
import mk.skillio.dto.EducationRequest;
import mk.skillio.dto.PostingRequest;
import mk.skillio.dto.PostingResponse;
import mk.skillio.dto.PostingSkillRequest;
import mk.skillio.dto.ProjectRequest;
import mk.skillio.dto.RegisterRequest;
import mk.skillio.dto.UpdateProfileRequest;
import mk.skillio.enums.Role;
import mk.skillio.exception.EmailAlreadyExistsException;
import mk.skillio.model.Category;
import mk.skillio.model.Skill;
import mk.skillio.repository.CategoryRepository;
import mk.skillio.repository.SkillRepository;
import mk.skillio.repository.UserRepository;
import mk.skillio.seed.SeedData.CompanySeed;
import mk.skillio.seed.SeedData.PostingSeed;
import mk.skillio.seed.SeedStudents.EducationSeed;
import mk.skillio.seed.SeedStudents.ProjectSeed;
import mk.skillio.seed.SeedStudents.SkillSeed;
import mk.skillio.seed.SeedStudents.StudentSeed;
import mk.skillio.service.AuthService;
import mk.skillio.service.CompanyProfileService;
import mk.skillio.service.EducationService;
import mk.skillio.service.PostingService;
import mk.skillio.service.ProjectService;
import mk.skillio.service.UserInterestService;
import mk.skillio.service.UserService;
import mk.skillio.service.UserSkillService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads the demo / evaluation data (10 companies, 40 postings, 20 students).
 * <p>
 * Runs ONLY with the Spring profile "seed". It is idempotent: accounts whose e-mail already
 * exists are skipped, so your own test accounts are never touched. All seeded accounts use
 * the reserved domain example.com, so no real e-mail can ever be sent to them.
 * <p>
 * Requirements: the database is running, the categories/skills already exist
 * (start the app once normally first) and the ai-service is running (embeddings).
 */
@Slf4j
@Component
@Profile("seed")
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {

    public static final String PASSWORD = "Seed12345!";

    private final AuthService authService;
    private final UserService userService;
    private final CompanyProfileService companyProfileService;
    private final PostingService postingService;
    private final UserSkillService userSkillService;
    private final UserInterestService userInterestService;
    private final ProjectService projectService;
    private final EducationService educationService;
    private final EmbeddingService embeddingService;
    private final CategoryRepository categoryRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            throw new IllegalStateException(
                    "Categories and skills do not exist yet. Start the application once WITHOUT the 'seed' profile, then run it again with it.");
        }

        Map<String, Long> categoryIds = new HashMap<>();
        for (Category c : categoryRepository.findAll()) {
            categoryIds.put(c.getName(), c.getId());
        }
        Map<String, Long> skillIds = new HashMap<>();
        for (Skill s : skillRepository.findAll()) {
            skillIds.put(s.getName(), s.getId());
        }

        Map<String, CompanySeed> companiesByKey = new HashMap<>();
        SeedData.COMPANIES.forEach(c -> companiesByKey.put(c.key(), c));

        List<Long> newPostingIds = new ArrayList<>();
        List<Long> newStudentIds = new ArrayList<>();

        log.info("[seed] Seeding companies and postings...");
        Map<String, Boolean> companyIsNew = new HashMap<>();
        for (CompanySeed c : SeedData.COMPANIES) {
            boolean created = registerCompany(c);
            companyIsNew.put(c.key(), created);
        }

        for (PostingSeed p : SeedData.POSTINGS) {
            if (!companyIsNew.get(p.companyKey())) {
                continue; // the company already existed, so its postings were created earlier
            }
            CompanySeed company = companiesByKey.get(p.companyKey());
            Long categoryId = require(categoryIds, p.category());

            List<PostingSkillRequest> skills = new ArrayList<>();
            for (String name : p.requiredSkills()) {
                skills.add(new PostingSkillRequest(require(skillIds, name), true));
            }
            for (String name : p.optionalSkills()) {
                skills.add(new PostingSkillRequest(require(skillIds, name), false));
            }

            PostingResponse created = postingService.create(company.email(), new PostingRequest(
                    p.title(),
                    p.description(company),
                    p.type(),
                    p.workMode(),
                    p.location(),
                    categoryId,
                    LocalDate.now().plusDays(p.deadlineInDays()),
                    skills));
            newPostingIds.add(created.id());
        }

        log.info("[seed] Seeding students...");
        for (StudentSeed s : SeedStudents.STUDENTS) {
            if (!registerStudent(s, categoryIds, skillIds)) {
                continue;
            }
            Long userId = userRepository.findByEmail(s.email()).orElseThrow().getId();
            newStudentIds.add(userId);
        }

        log.info("[seed] Generating embeddings: {} postings, {} students...",
                newPostingIds.size(), newStudentIds.size());
        int failed = 0;
        for (Long id : newPostingIds) {
            failed += refresh(() -> embeddingService.refreshPosting(id), "posting " + id);
        }
        for (Long id : newStudentIds) {
            failed += refresh(() -> embeddingService.refreshStudent(id), "student " + id);
        }

        printSummary(newPostingIds.size(), newStudentIds.size(), failed);
    }

    // ------------------------------------------------------------------ companies

    private boolean registerCompany(CompanySeed c) {
        try {
            authService.register(new RegisterRequest(c.email(), PASSWORD, c.name(), Role.COMPANY, c.name()));
        } catch (EmailAlreadyExistsException e) {
            log.info("[seed] Company {} already exists - skipped", c.email());
            return false;
        }
        companyProfileService.updateProfile(c.email(), new CompanyProfileRequest(
                c.name(), c.description(), c.website(), c.industry(), c.location()));
        return true;
    }

    // ------------------------------------------------------------------ students

    private boolean registerStudent(StudentSeed s, Map<String, Long> categoryIds, Map<String, Long> skillIds) {
        try {
            authService.register(new RegisterRequest(s.email(), PASSWORD, s.name(), Role.STUDENT, null));
        } catch (EmailAlreadyExistsException e) {
            log.info("[seed] Student {} already exists - skipped", s.email());
            return false;
        }

        userService.updateProfile(s.email(), new UpdateProfileRequest(s.name(), s.location(), s.bio()));

        for (SkillSeed skill : s.skills()) {
            userSkillService.setSkill(s.email(), require(skillIds, skill.name()), skill.level());
        }
        for (String category : s.interests()) {
            userInterestService.addInterest(s.email(), require(categoryIds, category));
        }
        for (ProjectSeed p : s.projects()) {
            projectService.create(s.email(), new ProjectRequest(p.title(), p.description(), p.link()));
        }
        for (EducationSeed e : s.education()) {
            educationService.create(s.email(), new EducationRequest(e.institution(), e.degree(), e.start(), e.end()));
        }
        return true;
    }

    // ------------------------------------------------------------------ helpers

    private static Long require(Map<String, Long> ids, String name) {
        Long id = ids.get(name);
        if (id == null) {
            throw new IllegalStateException("Seed data references an unknown skill/category: " + name);
        }
        return id;
    }

    private int refresh(Runnable action, String label) {
        try {
            action.run();
            return 0;
        } catch (Exception e) {
            log.warn("[seed] Embedding failed for {}: {}", label, e.getMessage());
            return 1;
        }
    }

    private void printSummary(int postings, int students, int failedEmbeddings) {
        log.info("[seed] ==================================================");
        log.info("[seed] Done. Created {} postings and {} students.", postings, students);
        if (failedEmbeddings > 0) {
            log.warn("[seed] {} embeddings FAILED - is the ai-service running? "
                    + "Start it and restart the backend: missing embeddings are filled on startup.", failedEmbeddings);
        }
        log.info("[seed] All seeded accounts use the password: {}", PASSWORD);
        log.info("[seed] Companies: {}", SeedData.COMPANIES.stream().map(CompanySeed::email).toList());
        log.info("[seed] Students:  {}", SeedStudents.STUDENTS.stream().map(StudentSeed::email).toList());
        log.info("[seed] ==================================================");
    }
}
