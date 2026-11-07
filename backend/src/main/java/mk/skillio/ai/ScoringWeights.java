package mk.skillio.ai;

import mk.skillio.enums.RecommendationMode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ScoringWeights {

    public record Weights(double embedding, double skills, double category) {
    }

    private final double embedding;
    private final double skills;
    private final double category;

    public ScoringWeights(@Value("${recommendation.weights.embedding:0.6}") double embedding,
                          @Value("${recommendation.weights.skills:0.3}") double skills,
                          @Value("${recommendation.weights.category:0.1}") double category) {
        this.embedding = embedding;
        this.skills = skills;
        this.category = category;
    }

    public Weights forMode(RecommendationMode mode, boolean hasVector) {
        return switch (mode) {
            case SKILLS -> new Weights(0, 1, 0);
            case EMBEDDING -> hasVector ? new Weights(1, 0, 0) : fallback();
            case HYBRID -> hasVector ? new Weights(embedding, skills, category) : fallback();
        };
    }

    // кога студентот нема вектор: само вештини и категорија, со иста пропорција
    private Weights fallback() {
        double sum = skills + category;
        return new Weights(0, skills / sum, category / sum);
    }
}