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

        seed("IT & Software",
                "Java", "Python", "JavaScript", "TypeScript", "C#", "C++", "SQL",
                "Spring Boot", "Hibernate", "REST API", "Node.js", "FastAPI",
                "React", "HTML", "CSS", "Tailwind CSS",
                "PostgreSQL", "MySQL", "MongoDB",
                "Git", "Docker", "Linux", "CI/CD",
                "Machine Learning", "NLP", "Pandas", "PyTorch");

        seed("Finance & Accounting",
                "Financial Analysis", "Accounting", "Excel", "Budgeting",
                "Financial Reporting", "Bookkeeping", "Auditing");

        seed("Marketing & Sales",
                "SEO", "Social Media Marketing", "Content Writing", "Copywriting",
                "Google Analytics", "Email Marketing", "Market Research", "Sales");

        seed("Design & Creative",
                "UI/UX Design", "Figma", "Photoshop", "Illustrator",
                "Graphic Design", "Video Editing");

        seed("Business & Management",
                "Project Management", "Business Analysis", "Team Leadership",
                "Customer Support", "Time Management", "Public Speaking");
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