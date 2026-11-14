package mk.skillio.seed;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import mk.skillio.dto.PostingResponse;
import mk.skillio.repository.UserRepository;
import mk.skillio.seed.SeedData.CompanySeed;
import mk.skillio.seed.SeedData.PostingSeed;
import mk.skillio.seed.SeedStudents.SkillSeed;
import mk.skillio.seed.SeedStudents.StudentSeed;
import mk.skillio.service.PostingService;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Writes the files the Python evaluation script reads:
 * <pre>
 *   evaluation/data/postings.csv    seeded postings (seed id, database id, skills, ...)
 *   evaluation/data/students.csv    seeded students (seed id, database id, skills, ...)
 *   evaluation/data/relevance.csv   ground truth grade (0/1/2) for every student-posting pair
 * </pre>
 * Paths are relative to the working directory (the project root when started from IntelliJ).
 * Runs at the end of the seeder, also when everything already existed, so the files are always current.
 */
@Slf4j
@Component
@Profile("seed")
@RequiredArgsConstructor
public class EvaluationExporter {

    private static final Path DATA_DIR = Path.of("evaluation", "data");
    private static final Path OVERRIDES = Path.of("evaluation", "overrides.csv");

    private final PostingService postingService;
    private final UserRepository userRepository;

    public void export() {
        try {
            Files.createDirectories(DATA_DIR);
            exportPostings();
            exportStudents();
            exportRelevance();
            log.info("[seed] Evaluation files written to {}", DATA_DIR.toAbsolutePath());
        } catch (IOException e) {
            throw new IllegalStateException("Could not write the evaluation files", e);
        }
    }

    private void exportPostings() throws IOException {
        Map<String, String> emailByCompany = new HashMap<>();
        for (CompanySeed c : SeedData.COMPANIES) {
            emailByCompany.put(c.key(), c.email());
        }
        Map<String, Map<String, Long>> idsByCompanyAndTitle = new HashMap<>();
        for (CompanySeed c : SeedData.COMPANIES) {
            Map<String, Long> byTitle = new HashMap<>();
            for (PostingResponse p : postingService.getMyPostings(c.email())) {
                byTitle.put(p.title(), p.id());
            }
            idsByCompanyAndTitle.put(c.key(), byTitle);
        }

        List<String> lines = new ArrayList<>();
        lines.add("seed_id,db_id,company_email,category,title,type,work_mode,required_skills,optional_skills");
        for (PostingSeed p : SeedData.POSTINGS) {
            Long dbId = idsByCompanyAndTitle.get(p.companyKey()).get(p.title());
            if (dbId == null) {
                throw new IllegalStateException("Posting not found in the database: " + p.id() + " " + p.title());
            }
            lines.add(String.join(",",
                    csv(p.id()), String.valueOf(dbId), csv(emailByCompany.get(p.companyKey())),
                    csv(p.category()), csv(p.title()), p.type().name(), p.workMode().name(),
                    csv(String.join(";", p.requiredSkills())),
                    csv(String.join(";", p.optionalSkills()))));
        }
        write("postings.csv", lines);
    }

    private void exportStudents() throws IOException {
        List<String> lines = new ArrayList<>();
        lines.add("seed_id,db_id,email,name,archetype,interests,skills");
        for (StudentSeed s : SeedStudents.STUDENTS) {
            Long dbId = userRepository.findByEmail(s.email())
                    .orElseThrow(() -> new IllegalStateException("Student not found: " + s.email()))
                    .getId();
            String skills = s.skills().stream()
                    .map((SkillSeed k) -> k.name() + ":" + k.level().name())
                    .collect(Collectors.joining(";"));
            lines.add(String.join(",",
                    csv(s.id()), String.valueOf(dbId), csv(s.email()), csv(s.name()),
                    csv(s.archetype()), csv(String.join(";", s.interests())), csv(skills)));
        }
        write("students.csv", lines);
    }

    private void exportRelevance() throws IOException {
        Map<String, Integer> overrides = readOverrides();
        List<String> lines = new ArrayList<>();
        lines.add("student_id,posting_id,grade");
        int relevant = 0;
        int partial = 0;
        for (SeedStudents.StudentSeed s : SeedStudents.STUDENTS) {
            for (PostingSeed p : SeedData.POSTINGS) {
                int grade = overrides.getOrDefault(s.id() + "|" + p.id(), GroundTruth.grade(s, p));
                if (grade == 2) {
                    relevant++;
                } else if (grade == 1) {
                    partial++;
                }
                lines.add(s.id() + "," + p.id() + "," + grade);
            }
        }
        write("relevance.csv", lines);
        log.info("[seed] Ground truth: {} pairs graded 2, {} graded 1, {} overrides applied",
                relevant, partial, overrides.size());
    }

    /** Optional manual corrections: lines of "student_id,posting_id,grade" (header allowed). */
    private Map<String, Integer> readOverrides() throws IOException {
        Map<String, Integer> result = new HashMap<>();
        if (!Files.exists(OVERRIDES)) {
            return result;
        }
        for (String line : Files.readAllLines(OVERRIDES, StandardCharsets.UTF_8)) {
            String[] parts = line.trim().split(",");
            if (parts.length != 3 || !parts[2].trim().matches("[012]")) {
                continue;
            }
            result.put(parts[0].trim() + "|" + parts[1].trim(), Integer.parseInt(parts[2].trim()));
        }
        return result;
    }

    private void write(String fileName, List<String> lines) throws IOException {
        Files.write(DATA_DIR.resolve(fileName), lines, StandardCharsets.UTF_8);
    }

    private static String csv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
