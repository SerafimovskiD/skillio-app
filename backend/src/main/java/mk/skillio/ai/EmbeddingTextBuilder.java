package mk.skillio.ai;

import lombok.RequiredArgsConstructor;
import mk.skillio.model.JobPosting;
import mk.skillio.model.PostingSkill;
import mk.skillio.model.User;
import mk.skillio.repository.EducationRepository;
import mk.skillio.repository.PostingSkillRepository;
import mk.skillio.repository.ProjectRepository;
import mk.skillio.repository.UserInterestRepository;
import mk.skillio.repository.UserSkillRepository;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class EmbeddingTextBuilder {

    private final UserSkillRepository userSkillRepository;
    private final UserInterestRepository userInterestRepository;
    private final ProjectRepository projectRepository;
    private final EducationRepository educationRepository;
    private final PostingSkillRepository postingSkillRepository;

    public String forStudent(User user) {
        List<String> parts = new ArrayList<>();

        String skills = userSkillRepository.findAllByUserIdWithSkill(user.getId()).stream()
                .map(us -> us.getSkill().getName() + " (" + us.getLevel() + ")")
                .collect(Collectors.joining(", "));
        add(parts, "Skills", skills);

        String interests = userInterestRepository.findAllByUserIdWithCategory(user.getId()).stream()
                .map(ui -> ui.getCategory().getName())
                .collect(Collectors.joining(", "));
        add(parts, "Interests", interests);

        String projects = projectRepository.findByUserId(user.getId()).stream()
                .map(p -> joinNonBlank(" - ", p.getTitle(), p.getDescription()))
                .collect(Collectors.joining("; "));
        add(parts, "Projects", projects);

        String education = educationRepository.findByUserId(user.getId()).stream()
                .map(e -> joinNonBlank(", ", e.getInstitution(), e.getDegree()))
                .collect(Collectors.joining("; "));
        add(parts, "Education", education);

        add(parts, "Bio", user.getBio());
        return String.join(". ", parts);
    }

    public String forPosting(JobPosting posting) {
        List<PostingSkill> skills = postingSkillRepository.findAllByPostingIds(List.of(posting.getId()));

        List<String> parts = new ArrayList<>();
        parts.add(joinNonBlank(". ", posting.getTitle(),
                posting.getType() + " in " + posting.getCategory().getName()));
        add(parts, "Required skills", namesOf(skills, true));
        add(parts, "Preferred skills", namesOf(skills, false));
        add(parts, "Description", posting.getDescription());
        return String.join(". ", parts);
    }

    private String namesOf(List<PostingSkill> skills, boolean required) {
        return skills.stream()
                .filter(ps -> ps.isRequired() == required)
                .map(ps -> ps.getSkill().getName())
                .collect(Collectors.joining(", "));
    }

    private void add(List<String> parts, String label, String value) {
        if (value != null && !value.isBlank()) {
            parts.add(label + ": " + value.trim());
        }
    }

    private String joinNonBlank(String separator, String... values) {
        return Arrays.stream(values)
                .filter(v -> v != null && !v.isBlank())
                .map(String::trim)
                .collect(Collectors.joining(separator));
    }
}