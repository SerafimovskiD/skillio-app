package mk.skillio.config;

import lombok.RequiredArgsConstructor;
import mk.skillio.model.Category;
import mk.skillio.model.Skill;
import mk.skillio.repository.CategoryRepository;
import mk.skillio.repository.SkillRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final SkillRepository skillRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            return; // веќе има податоци, не додавај повторно
        }

        seed("Programming languages", "Java", "Python", "JavaScript", "TypeScript", "C#", "C++", "SQL");
        seed("Backend", "Spring Boot", "Hibernate", "REST API", "Node.js", "FastAPI");
        seed("Frontend", "React", "HTML", "CSS", "Tailwind CSS");
        seed("Databases", "PostgreSQL", "MySQL", "MongoDB");
        seed("DevOps & Tools", "Git", "Docker", "Linux", "CI/CD");
        seed("AI & Data", "Machine Learning", "NLP", "Pandas", "PyTorch");
    }

    private void seed(String categoryName, String... skillNames) {
        Category category = new Category();
        category.setName(categoryName);
        categoryRepository.save(category);

        for (String name : skillNames) {
            Skill skill = new Skill();
            skill.setName(name);
            skill.setCategory(category);
            skillRepository.save(skill);
        }
    }
}