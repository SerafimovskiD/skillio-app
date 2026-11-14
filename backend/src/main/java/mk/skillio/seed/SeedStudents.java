package mk.skillio.seed;

import mk.skillio.enums.SkillLevel;

import java.time.LocalDate;
import java.util.List;

import static mk.skillio.seed.SeedData.CAT_BUS;
import static mk.skillio.seed.SeedData.CAT_DES;
import static mk.skillio.seed.SeedData.CAT_FIN;
import static mk.skillio.seed.SeedData.CAT_IT;
import static mk.skillio.seed.SeedData.CAT_MKT;

/**
 * Fixed, reproducible student profiles (20). Each one is an archetype:
 * S01-S18 are clear profiles of one category, S19 is a borderline finance + data profile,
 * S20 is a deliberately weak/vague profile.
 */
public final class SeedStudents {

    private SeedStudents() {
    }

    public record SkillSeed(String name, SkillLevel level) {
    }

    public record ProjectSeed(String title, String description, String link) {
    }

    public record EducationSeed(String institution, String degree, LocalDate start, LocalDate end) {
    }

    public record StudentSeed(String id, String email, String name, String location, String bio,
                              String archetype,
                              List<SkillSeed> skills, List<String> interests,
                              List<ProjectSeed> projects, List<EducationSeed> education) {
    }

    private static SkillSeed adv(String n) {
        return new SkillSeed(n, SkillLevel.ADVANCED);
    }

    private static SkillSeed mid(String n) {
        return new SkillSeed(n, SkillLevel.INTERMEDIATE);
    }

    private static SkillSeed beg(String n) {
        return new SkillSeed(n, SkillLevel.BEGINNER);
    }

    private static List<SkillSeed> skills(SkillSeed... s) {
        return List.of(s);
    }

    private static List<String> interests(String... s) {
        return List.of(s);
    }

    private static List<ProjectSeed> projects(ProjectSeed... p) {
        return List.of(p);
    }

    private static ProjectSeed proj(String title, String description) {
        return new ProjectSeed(title, description, null);
    }

    private static List<EducationSeed> edu(String institution, String degree, int startYear, Integer endYear) {
        LocalDate end = endYear == null ? null : LocalDate.of(endYear, 7, 1);
        return List.of(new EducationSeed(institution, degree, LocalDate.of(startYear, 10, 1), end));
    }

    private static final String FINKI = "Ss. Cyril and Methodius University, Faculty of Computer Science and Engineering";
    private static final String FEE = "Ss. Cyril and Methodius University, Faculty of Economics";
    private static final String FD = "Ss. Cyril and Methodius University, Faculty of Dramatic Arts and Design";
    private static final String UKIM_FON = "FON University";
    private static final String BIT = "Bitola Faculty of Economics";

    public static final List<StudentSeed> STUDENTS = List.of(

            // ------------------------------------------------------------ IT & Software
            new StudentSeed("S01", "stefan.trajkovski@example.com", "Stefan Trajkovski", "Skopje",
                    "Computer science student focused on backend development. I enjoy designing clean REST APIs with Java and Spring Boot "
                            + "and working with relational databases.",
                    "Java backend developer",
                    skills(adv("Java"), adv("Spring Boot"), mid("REST API"), mid("SQL"), mid("PostgreSQL"), mid("Hibernate"), mid("Git"), beg("Docker")),
                    interests(CAT_IT),
                    projects(proj("Library Management API", "Spring Boot REST API with JWT authentication, PostgreSQL and Hibernate for managing books and loans."),
                            proj("Online Course Platform", "Backend for a course platform with users, enrolments and payments built with Java and Spring Boot.")),
                    edu(FINKI, "BSc Computer Science and Engineering", 2022, null)),

            new StudentSeed("S02", "ivana.stojanovska@example.com", "Ivana Stojanovska", "Skopje",
                    "Frontend-focused student who loves turning designs into fast, accessible interfaces with React.",
                    "Frontend React developer",
                    skills(adv("JavaScript"), adv("React"), adv("HTML"), adv("CSS"), mid("Tailwind CSS"), mid("TypeScript"), mid("Git"), beg("Figma")),
                    interests(CAT_IT),
                    projects(proj("Recipe Sharing App", "Responsive React application with search, filters and a favourites list, styled with Tailwind CSS."),
                            proj("Personal Portfolio", "Portfolio website with animations and dark mode built with React and CSS.")),
                    edu(FINKI, "BSc Computer Science and Engineering", 2022, null)),

            new StudentSeed("S03", "nikola.dimitrievski@example.com", "Nikola Dimitrievski", "Bitola",
                    "Full-stack developer in training. I like building complete web applications from the database to the user interface.",
                    "Full-stack JavaScript developer",
                    skills(adv("JavaScript"), mid("Node.js"), mid("React"), mid("REST API"), mid("MongoDB"), mid("Docker"), mid("Git"), beg("TypeScript")),
                    interests(CAT_IT),
                    projects(proj("Real-Time Chat", "Chat application with Node.js, WebSockets, MongoDB and a React frontend."),
                            proj("Expense Tracker", "Full-stack expense tracker with a REST API and charts, deployed with Docker.")),
                    edu(FINKI, "BSc Computer Science and Engineering", 2021, null)),

            new StudentSeed("S04", "elena.ristovska@example.com", "Elena Ristovska", "Skopje",
                    "Interested in machine learning and natural language processing. I have trained text classification models and "
                            + "built small data pipelines in Python.",
                    "Machine learning / NLP student",
                    skills(adv("Python"), mid("Machine Learning"), mid("Pandas"), mid("PyTorch"), mid("NLP"), mid("SQL"), beg("Git")),
                    interests(CAT_IT),
                    projects(proj("News Topic Classifier", "Multilingual text classifier trained with PyTorch and evaluated with cross-validation."),
                            proj("Sentiment Analysis of Reviews", "NLP pipeline in Python that cleans, embeds and classifies product reviews.")),
                    edu(FINKI, "BSc Computer Science and Engineering", 2022, null)),

            new StudentSeed("S05", "filip.angelovski@example.com", "Filip Angelovski", "Bitola",
                    "I enjoy Linux, automation and everything that happens between code and production. I run my own home server with Docker.",
                    "DevOps / infrastructure enthusiast",
                    skills(adv("Linux"), adv("Docker"), mid("Git"), mid("CI/CD"), mid("Python"), beg("SQL")),
                    interests(CAT_IT),
                    projects(proj("Home Lab", "Self-hosted services running in Docker containers on Linux with automated backups and monitoring."),
                            proj("CI Pipeline for a Student Project", "GitHub Actions pipeline that builds, tests and deploys a web application.")),
                    edu(FINKI, "BSc Computer Science and Engineering", 2021, null)),

            // ------------------------------------------------------------ Finance & Accounting
            new StudentSeed("S06", "sara.kostovska@example.com", "Sara Kostovska", "Skopje",
                    "Finance student who enjoys financial modelling and turning numbers into clear recommendations.",
                    "Financial analyst",
                    skills(adv("Financial Analysis"), adv("Excel"), mid("Financial Reporting"), mid("Budgeting"), beg("SQL")),
                    interests(CAT_FIN),
                    projects(proj("Company Valuation Case", "Valuation model of a listed regional company with discounted cash flow and sensitivity analysis in Excel.")),
                    edu(FEE, "BSc Finance", 2022, null)),

            new StudentSeed("S07", "martin.jovanovski@example.com", "Martin Jovanovski", "Skopje",
                    "Accounting student preparing for a career in audit. I am careful, structured and enjoy checking that the numbers add up.",
                    "Accounting and audit student",
                    skills(adv("Accounting"), mid("Auditing"), mid("Bookkeeping"), adv("Excel"), mid("Financial Reporting")),
                    interests(CAT_FIN),
                    projects(proj("Internal Controls Review", "University case study testing internal controls of a small trading company.")),
                    edu(FEE, "BSc Accounting and Auditing", 2022, null)),

            new StudentSeed("S08", "teodora.nikolovska@example.com", "Teodora Nikolovska", "Kumanovo",
                    "Recently finished a bookkeeping course and looking for a first step into accounting.",
                    "Junior bookkeeper",
                    skills(mid("Bookkeeping"), beg("Accounting"), mid("Excel")),
                    interests(CAT_FIN),
                    projects(),
                    edu(BIT, "BSc Business Economics", 2021, null)),

            // ------------------------------------------------------------ Marketing & Sales
            new StudentSeed("S09", "viktor.mitrevski@example.com", "Viktor Mitrevski", "Skopje",
                    "Digital marketing student interested in search and content. I optimised the website of a local business and tripled its organic traffic.",
                    "SEO and content marketer",
                    skills(adv("SEO"), adv("Content Writing"), mid("Google Analytics"), mid("Copywriting"), beg("Market Research")),
                    interests(CAT_MKT),
                    projects(proj("Local Business SEO Case", "Keyword research, on-page optimisation and content plan for a local restaurant website.")),
                    edu(FEE, "BSc Marketing", 2022, null)),

            new StudentSeed("S10", "anastasija.georgievska@example.com", "Anastasija Georgievska", "Ohrid",
                    "Creative, social-media-native student. I run an Instagram page with 15k followers and love storytelling for brands.",
                    "Social media marketer",
                    skills(adv("Social Media Marketing"), mid("Content Writing"), mid("Copywriting"), beg("Google Analytics"), beg("Photoshop")),
                    interests(CAT_MKT),
                    projects(proj("Travel Instagram Page", "Created and grew a travel page to 15k followers with a consistent content calendar and short videos.")),
                    edu(FEE, "BSc Marketing", 2021, null)),

            new StudentSeed("S11", "david.popovski@example.com", "David Popovski", "Tetovo",
                    "Outgoing and persuasive. I have worked in retail sales for two summers and want to start a career in B2B sales.",
                    "Sales-oriented student",
                    skills(adv("Sales"), adv("Public Speaking"), mid("Market Research"), beg("Email Marketing")),
                    interests(CAT_MKT),
                    projects(),
                    edu(UKIM_FON, "BSc Business Administration", 2021, null)),

            new StudentSeed("S12", "katerina.velkovska@example.com", "Katerina Velkovska", "Skopje",
                    "Growth-minded marketer who likes testing, measuring and improving campaigns with data.",
                    "Email and growth marketer",
                    skills(adv("Email Marketing"), adv("Google Analytics"), mid("SEO"), mid("Copywriting"), mid("Social Media Marketing")),
                    interests(CAT_MKT),
                    projects(proj("Newsletter Growth Experiment", "Grew a student newsletter from 200 to 2,000 subscribers using A/B tested subject lines and landing pages.")),
                    edu(FEE, "BSc Marketing", 2022, null)),

            // ------------------------------------------------------------ Design & Creative
            new StudentSeed("S13", "jana.todorovska@example.com", "Jana Todorovska", "Skopje",
                    "UI/UX design student who loves research, prototyping and clean interfaces. I also know enough HTML and CSS to talk to developers.",
                    "UI/UX designer",
                    skills(adv("UI/UX Design"), adv("Figma"), mid("Graphic Design"), mid("HTML"), beg("CSS")),
                    interests(CAT_DES),
                    projects(proj("Mobile Banking Redesign", "UX case study with user interviews, wireframes and a clickable Figma prototype."),
                            proj("Design System for a Student App", "Component library and style guide in Figma.")),
                    edu(FD, "BA Visual Communication Design", 2022, null)),

            new StudentSeed("S14", "luka.spasovski@example.com", "Luka Spasovski", "Ohrid",
                    "Graphic designer with a love for typography and brand identity. I design logos, posters and packaging.",
                    "Graphic and brand designer",
                    skills(adv("Graphic Design"), adv("Photoshop"), adv("Illustrator"), beg("Figma")),
                    interests(CAT_DES),
                    projects(proj("Coffee Brand Identity", "Complete visual identity with logo, packaging and brand guidelines for a fictional coffee brand.")),
                    edu(FD, "BA Graphic Design", 2021, null)),

            new StudentSeed("S15", "bojan.krstevski@example.com", "Bojan Krstevski", "Skopje",
                    "Video editor and content creator. I edit short-form videos, music clips and promotional videos.",
                    "Video editor",
                    skills(adv("Video Editing"), mid("Photoshop"), mid("Social Media Marketing"), beg("Illustrator")),
                    interests(CAT_DES),
                    projects(proj("Music Video Edit", "Edited and colour-graded a music video that gained 60k views.")),
                    edu(FD, "BA Film and Video", 2022, null)),

            // ------------------------------------------------------------ Business & Management
            new StudentSeed("S16", "mila.ilievska@example.com", "Mila Ilievska", "Skopje",
                    "Organised and calm under pressure. I led the student organisation's events team and enjoy coordinating people and deadlines.",
                    "Project manager",
                    skills(adv("Project Management"), adv("Time Management"), adv("Team Leadership"), mid("Business Analysis")),
                    interests(CAT_BUS),
                    projects(proj("University Hackathon Organisation", "Coordinated a 120-participant hackathon with a team of 10 volunteers, budget and sponsors.")),
                    edu(UKIM_FON, "BSc Management", 2022, null)),

            new StudentSeed("S17", "andrej.markovski@example.com", "Andrej Markovski", "Skopje",
                    "Analytical student who likes understanding how a business works and improving its processes with data.",
                    "Business analyst",
                    skills(adv("Business Analysis"), mid("SQL"), adv("Excel"), mid("Project Management")),
                    interests(CAT_BUS),
                    projects(proj("Process Improvement Case", "Mapped and redesigned the order-handling process of a small e-commerce company.")),
                    edu(FEE, "BSc Business Informatics", 2021, null)),

            new StudentSeed("S18", "simona.arsovska@example.com", "Simona Arsovska", "Stip",
                    "Friendly and patient communicator with experience in a call centre. I like helping people solve problems.",
                    "Customer support specialist",
                    skills(adv("Customer Support"), mid("Public Speaking"), adv("Time Management")),
                    interests(CAT_BUS),
                    projects(),
                    edu(UKIM_FON, "BSc Business Administration", 2022, null)),

            // ------------------------------------------------------------ Borderline / weak
            new StudentSeed("S19", "kristijan.zdravkovski@example.com", "Kristijan Zdravkovski", "Skopje",
                    "Finance student with a strong interest in data. I combine financial analysis with SQL and Python to find insights in company data.",
                    "Borderline: finance + data",
                    skills(adv("Financial Analysis"), adv("SQL"), mid("Python"), mid("Pandas"), mid("Excel")),
                    interests(CAT_FIN, CAT_IT),
                    projects(proj("Stock Returns Analysis", "Python and Pandas analysis of regional stock returns with SQL data preparation.")),
                    edu(FEE, "BSc Finance", 2021, null)),

            new StudentSeed("S20", "dario.naumovski@example.com", "Dario Naumovski", "Skopje",
                    "Second-year student, still exploring what I like. Open to learning new things.",
                    "Weak / vague profile",
                    skills(beg("Time Management"), beg("Excel"), beg("Public Speaking")),
                    interests(CAT_BUS),
                    projects(),
                    edu(UKIM_FON, "BSc Business Administration", 2024, null))
    );
}
