package mk.skillio.seed;

import mk.skillio.seed.SeedData.PostingSeed;
import mk.skillio.seed.SeedStudents.SkillSeed;
import mk.skillio.seed.SeedStudents.StudentSeed;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * Ground-truth relevance for the evaluation: how relevant is a posting for a student?
 * <p>
 * The rule is fixed BEFORE any measurement and uses only the seed definitions (declared skills,
 * declared interests, required skills of the posting). It never looks at the recommender's output
 * or at embeddings, so the evaluation does not grade the algorithm with its own answers.
 * <p>
 * Grades: 2 = relevant, 1 = partially relevant, 0 = not relevant.
 * <ul>
 *   <li>2: the posting is in one of the student's fields AND the student has at least 75% of the required skills</li>
 *   <li>1: in the student's field and has at least 30% of the required skills,
 *       OR outside the field but has at least 66% of the required skills (and at least two of them)</li>
 *   <li>0: everything else</li>
 * </ul>
 * Borderline pairs can be corrected by hand in evaluation/overrides.csv (student_id,posting_id,grade).
 */
public final class GroundTruth {

    public static final double STRONG_COVERAGE = 0.75;
    public static final double PARTIAL_COVERAGE = 0.30;
    public static final double CROSS_FIELD_COVERAGE = 0.66;

    private GroundTruth() {
    }

    public static int grade(StudentSeed student, PostingSeed posting) {
        Set<String> have = student.skills().stream()
                .map(SkillSeed::name)
                .collect(Collectors.toSet());

        long matched = posting.requiredSkills().stream().filter(have::contains).count();
        double coverage = posting.requiredSkills().isEmpty()
                ? 0.0
                : (double) matched / posting.requiredSkills().size();
        boolean inField = student.interests().contains(posting.category());

        if (inField && coverage >= STRONG_COVERAGE) {
            return 2;
        }
        if (inField && coverage >= PARTIAL_COVERAGE) {
            return 1;
        }
        if (!inField && matched >= 2 && coverage >= CROSS_FIELD_COVERAGE) {
            return 1;
        }
        return 0;
    }
}
