package mk.skillio.seed;

import mk.skillio.enums.PostingType;
import mk.skillio.enums.WorkMode;

import java.util.List;

import static mk.skillio.enums.PostingType.INTERNSHIP;
import static mk.skillio.enums.PostingType.JOB;
import static mk.skillio.enums.WorkMode.HYBRID;
import static mk.skillio.enums.WorkMode.ON_SITE;
import static mk.skillio.enums.WorkMode.REMOTE;

/**
 * Fixed, reproducible demo/evaluation data: 10 companies and 40 job postings.
 * Postings are written in English, in the style of a careers page.
 * Skill and category names must match DataInitializer exactly.
 */
public final class SeedData {

    private SeedData() {
    }

    public static final String CAT_IT = "IT & Software";
    public static final String CAT_FIN = "Finance & Accounting";
    public static final String CAT_MKT = "Marketing & Sales";
    public static final String CAT_DES = "Design & Creative";
    public static final String CAT_BUS = "Business & Management";

    public record CompanySeed(String key, String email, String name, String industry,
                              String location, String website, String description,
                              List<String> perks) {
    }

    public record PostingSeed(String id, String companyKey, String category, String title,
                              PostingType type, WorkMode workMode, String location,
                              int deadlineInDays, String about,
                              List<String> responsibilities, List<String> requirements,
                              List<String> requiredSkills, List<String> optionalSkills) {

        public String description(CompanySeed company) {
            StringBuilder sb = new StringBuilder();
            sb.append("About the role\n").append(about).append("\n\n");
            sb.append("Responsibilities\n");
            responsibilities.forEach(r -> sb.append("- ").append(r).append("\n"));
            sb.append("\nRequirements\n");
            requirements.forEach(r -> sb.append("- ").append(r).append("\n"));
            sb.append("\nWhat we offer\n");
            if (type == INTERNSHIP) {
                sb.append("- A paid internship with a dedicated mentor and a realistic path to a full-time offer\n");
            } else {
                sb.append("- A competitive salary and a clear path for professional growth\n");
            }
            company.perks().forEach(p -> sb.append("- ").append(p).append("\n"));
            return sb.toString().trim();
        }
    }

    private static List<String> l(String... items) {
        return List.of(items);
    }

    private static PostingSeed p(String id, String company, String category, String title,
                                 PostingType type, WorkMode mode, String location, int days,
                                 String about, List<String> resp, List<String> req,
                                 List<String> required, List<String> optional) {
        return new PostingSeed(id, company, category, title, type, mode, location, days,
                about, resp, req, required, optional);
    }

    // ------------------------------------------------------------------ companies

    public static final List<CompanySeed> COMPANIES = List.of(
            new CompanySeed("novabyte", "novabyte@example.com", "NovaByte Labs", "Software Development",
                    "Skopje", "https://novabyte.example.com",
                    "NovaByte Labs is a product-focused software company building web platforms for clients across Europe. "
                            + "Our teams of 6-8 engineers and designers own products end to end, from discovery to production.",
                    l("A hybrid schedule with flexible working hours", "A yearly learning budget for courses and conferences")),
            new CompanySeed("stackline", "stackline@example.com", "Stackline Systems", "IT Services",
                    "Skopje", "https://stackline.example.com",
                    "Stackline Systems delivers custom software and cloud infrastructure for banks, retailers and public-sector clients. "
                            + "We value clean engineering practices, code reviews and steady knowledge sharing.",
                    l("Regular internal tech talks and pair-programming sessions", "Private health insurance after the probation period")),
            new CompanySeed("vertex", "vertex@example.com", "Vertex Analytics", "Data & AI",
                    "Remote", "https://vertex.example.com",
                    "Vertex Analytics is a remote-first data and AI company. We build forecasting, language-understanding and "
                            + "reporting tools that help mid-sized businesses make better decisions with their data.",
                    l("Fully remote work with a home-office allowance", "Time every week dedicated to research and experimentation")),
            new CompanySeed("meridian", "meridian@example.com", "Meridian Capital Partners", "Financial Services",
                    "Skopje", "https://meridian.example.com",
                    "Meridian Capital Partners is an investment and advisory firm supporting regional companies with financial planning, "
                            + "reporting and capital strategy.",
                    l("Structured onboarding with experienced senior analysts", "Support for professional certifications such as ACCA and CFA")),
            new CompanySeed("balkanledger", "balkanledger@example.com", "Balkan Ledger & Audit", "Accounting & Audit",
                    "Skopje", "https://balkanledger.example.com",
                    "Balkan Ledger & Audit provides audit, bookkeeping and accounting services to more than 200 small and "
                            + "mid-sized businesses across North Macedonia.",
                    l("Paid exam leave and certification support", "A friendly team with clear mentoring from partners")),
            new CompanySeed("pulse", "pulse@example.com", "Pulse Digital Agency", "Digital Marketing",
                    "Skopje", "https://pulse.example.com",
                    "Pulse Digital Agency is a full-service digital marketing agency. We combine content, search and social media "
                            + "to grow brands in competitive markets.",
                    l("Creative, collaborative studio culture", "Flexible hybrid work and regular team workshops")),
            new CompanySeed("brightwave", "brightwave@example.com", "Brightwave Commerce", "E-commerce",
                    "Skopje", "https://brightwave.example.com",
                    "Brightwave Commerce operates online stores and sells consumer products across the Balkans. "
                            + "We are growing fast and invest heavily in marketing, sales and customer experience.",
                    l("Performance-based bonuses", "Employee discounts on all Brightwave products")),
            new CompanySeed("pixelforge", "pixelforge@example.com", "Pixelforge Studio", "Design Studio",
                    "Skopje", "https://pixelforge.example.com",
                    "Pixelforge Studio is a design studio crafting digital products, brands and videos for startups and established companies. "
                            + "Our work is guided by research, craft and close collaboration with clients.",
                    l("A modern studio with the latest design tools provided", "Time for personal projects and portfolio building")),
            new CompanySeed("orbit", "orbit@example.com", "Orbit Consulting Group", "Management Consulting",
                    "Skopje", "https://orbit.example.com",
                    "Orbit Consulting Group helps organizations improve how they plan, deliver and measure projects. "
                            + "Our consultants work in small cross-functional teams on real transformation programs.",
                    l("Mentorship from senior consultants", "Training in project management methodologies")),
            new CompanySeed("northgate", "northgate@example.com", "Northgate Logistics", "Logistics & Supply Chain",
                    "Stip", "https://northgate.example.com",
                    "Northgate Logistics moves goods across the region with a modern fleet and a growing warehouse network. "
                            + "Our back-office teams keep operations, customers and finances running smoothly.",
                    l("Stable, growing company with long-term career paths", "Meal allowance and company transport"))
    );

    // ------------------------------------------------------------------ postings

    public static final List<PostingSeed> POSTINGS = List.of(

            // ============================================================ IT & Software
            p("IT-01", "novabyte", CAT_IT, "Junior Java Backend Developer", JOB, HYBRID, "Skopje", 45,
                    "Join our backend team and help us build the services behind our client platforms. You will work with experienced engineers on "
                            + "production Java applications and grow quickly through code reviews and pair programming.",
                    l("Develop and maintain REST APIs with Java and Spring Boot",
                            "Write and optimise SQL queries and database migrations",
                            "Write unit and integration tests for new features",
                            "Take part in code reviews and sprint planning"),
                    l("Solid knowledge of Java and object-oriented programming",
                            "Experience with Spring Boot and building REST APIs",
                            "Good understanding of SQL and relational databases",
                            "Familiarity with Hibernate, PostgreSQL, Git or Docker is a plus"),
                    l("Java", "Spring Boot", "REST API", "SQL"),
                    l("Hibernate", "PostgreSQL", "Git", "Docker")),

            p("IT-02", "novabyte", CAT_IT, "Frontend Developer Intern (React)", INTERNSHIP, HYBRID, "Skopje", 30,
                    "A hands-on internship for students who enjoy building user interfaces. You will ship real features to production "
                            + "in our React applications, guided by a senior frontend developer.",
                    l("Build responsive UI components in React",
                            "Turn design mockups into clean HTML and CSS",
                            "Fix bugs and improve accessibility and performance",
                            "Collaborate with designers and backend engineers"),
                    l("Good knowledge of JavaScript, HTML and CSS",
                            "Basic experience with React from a course or personal project",
                            "Interest in TypeScript or Tailwind CSS is welcome",
                            "Comfortable using Git"),
                    l("JavaScript", "React", "HTML", "CSS"),
                    l("TypeScript", "Tailwind CSS", "Git")),

            p("IT-03", "stackline", CAT_IT, "Full-Stack Developer (Node.js & React)", JOB, REMOTE, "Remote", 60,
                    "We are looking for a full-stack developer to build and evolve internal tools and customer-facing web applications. "
                            + "You will own features across the stack, from the database to the browser.",
                    l("Design and implement REST APIs with Node.js",
                            "Build modern user interfaces with React",
                            "Model data and write efficient queries",
                            "Improve code quality, tests and deployment processes"),
                    l("2+ years of experience with JavaScript, Node.js and React",
                            "Experience designing and consuming REST APIs",
                            "Familiarity with TypeScript, MongoDB or PostgreSQL",
                            "Experience with Docker is an advantage"),
                    l("JavaScript", "Node.js", "React", "REST API"),
                    l("TypeScript", "MongoDB", "PostgreSQL", "Docker")),

            p("IT-04", "stackline", CAT_IT, "DevOps Engineer Intern", INTERNSHIP, ON_SITE, "Bitola", 35,
                    "Learn how modern software is built, shipped and operated. You will work with our infrastructure team on automation, "
                            + "containers and deployment pipelines.",
                    l("Help maintain Linux servers and containerised services",
                            "Write scripts to automate repetitive operations tasks",
                            "Support the setup and improvement of CI/CD pipelines",
                            "Monitor services and assist with incident investigations"),
                    l("Working knowledge of Linux and the command line",
                            "Basic understanding of Docker and containers",
                            "Experience with Git and version control",
                            "Knowledge of CI/CD or Python scripting is a plus"),
                    l("Linux", "Docker", "Git"),
                    l("CI/CD", "Python")),

            p("IT-05", "vertex", CAT_IT, "Machine Learning Engineer Intern", INTERNSHIP, REMOTE, "Remote", 40,
                    "Work with our data science team on real machine learning problems. You will explore data, train models and help bring "
                            + "them from notebooks to production.",
                    l("Clean, explore and visualise datasets with Pandas",
                            "Train and evaluate machine learning models",
                            "Document experiments and share findings with the team",
                            "Support the deployment of models as services"),
                    l("Good knowledge of Python and data analysis with Pandas",
                            "Understanding of core machine learning concepts",
                            "Coursework or projects in PyTorch or NLP are a plus",
                            "Basic SQL and Git skills"),
                    l("Python", "Machine Learning", "Pandas"),
                    l("PyTorch", "NLP", "SQL", "Git")),

            p("IT-06", "vertex", CAT_IT, "NLP Engineer", JOB, REMOTE, "Remote", 70,
                    "Help us build language-understanding features such as semantic search, text classification and document analysis. "
                            + "You will design, train and serve NLP models used by our clients every day.",
                    l("Develop and fine-tune NLP models with PyTorch",
                            "Build model-serving APIs with FastAPI",
                            "Evaluate model quality and improve it iteratively",
                            "Collaborate with product and engineering on new features"),
                    l("Strong Python skills and hands-on NLP experience",
                            "Experience training models with PyTorch",
                            "Experience building APIs with FastAPI",
                            "Knowledge of machine learning fundamentals, Docker and Git is a plus"),
                    l("Python", "NLP", "PyTorch", "FastAPI"),
                    l("Machine Learning", "Docker", "Git")),

            p("IT-07", "stackline", CAT_IT, ".NET Developer", JOB, ON_SITE, "Skopje", 50,
                    "Join a team delivering line-of-business applications for financial and retail clients. You will build and maintain "
                            + "backend services on the .NET platform.",
                    l("Develop backend services and APIs in C#",
                            "Design database schemas and write SQL queries",
                            "Maintain and improve existing applications",
                            "Contribute to CI/CD pipelines and releases"),
                    l("Solid experience with C# and .NET",
                            "Good knowledge of SQL and relational databases",
                            "Experience building REST APIs",
                            "Familiarity with MySQL, Git or CI/CD is a plus"),
                    l("C#", "SQL", "REST API"),
                    l("MySQL", "Git", "CI/CD")),

            p("IT-08", "novabyte", CAT_IT, "Python Backend Developer (FastAPI)", JOB, HYBRID, "Ohrid", 55,
                    "Build fast, reliable APIs that power our data-driven products. You will design services in Python and "
                            + "work closely with the frontend and data teams.",
                    l("Design and implement APIs with FastAPI",
                            "Model data and optimise queries in PostgreSQL",
                            "Containerise services and support deployments",
                            "Write automated tests and technical documentation"),
                    l("Strong Python skills and experience with FastAPI",
                            "Good knowledge of PostgreSQL and REST API design",
                            "Comfortable working with Linux, Docker and Git"),
                    l("Python", "FastAPI", "PostgreSQL", "REST API"),
                    l("Docker", "Linux", "Git")),

            // ============================================================ Finance & Accounting
            p("FIN-01", "meridian", CAT_FIN, "Junior Financial Analyst", JOB, ON_SITE, "Skopje", 40,
                    "Support our advisory team with financial modelling and analysis for regional clients. This is an excellent first step "
                            + "for a graduate who wants a career in corporate finance.",
                    l("Build and maintain financial models in Excel",
                            "Prepare monthly and quarterly financial reports",
                            "Analyse company performance and highlight key trends",
                            "Support budgeting and forecasting cycles"),
                    l("Degree in finance, economics or a related field",
                            "Strong Excel skills",
                            "Understanding of financial analysis and financial reporting",
                            "Knowledge of budgeting or SQL is a plus"),
                    l("Financial Analysis", "Excel", "Financial Reporting"),
                    l("Budgeting", "SQL")),

            p("FIN-02", "meridian", CAT_FIN, "Finance Intern", INTERNSHIP, HYBRID, "Skopje", 28,
                    "Get practical experience in a professional finance team. You will assist analysts and accountants with day-to-day work "
                            + "while learning how a financial advisory firm operates.",
                    l("Prepare and reconcile spreadsheets in Excel",
                            "Assist with recording and checking accounting entries",
                            "Support the preparation of budgets and reports",
                            "Help the team with ad-hoc analysis"),
                    l("Student or recent graduate in finance, accounting or economics",
                            "Good command of Excel",
                            "Basic understanding of accounting principles",
                            "Interest in budgeting and financial analysis"),
                    l("Excel", "Accounting"),
                    l("Budgeting", "Financial Analysis")),

            p("FIN-03", "balkanledger", CAT_FIN, "Audit Associate", JOB, ON_SITE, "Skopje", 65,
                    "Join our audit practice and work on engagements for a diverse portfolio of clients. You will plan, execute and "
                            + "document audit procedures under the guidance of senior auditors.",
                    l("Perform audit procedures and test internal controls",
                            "Analyse ledgers and supporting documents in Excel",
                            "Prepare working papers and audit documentation",
                            "Communicate findings to senior team members and clients"),
                    l("Degree in accounting, finance or economics",
                            "Knowledge of auditing standards and accounting principles",
                            "Strong Excel skills",
                            "Experience with financial reporting is an advantage"),
                    l("Auditing", "Accounting", "Excel"),
                    l("Financial Reporting")),

            p("FIN-04", "balkanledger", CAT_FIN, "Audit Intern", INTERNSHIP, ON_SITE, "Skopje", 32,
                    "A structured internship for students who want to start a career in audit. You will join real engagements "
                            + "and learn the audit process from planning to reporting.",
                    l("Assist in testing transactions and balances",
                            "Organise audit evidence and working papers",
                            "Use Excel to analyse client data",
                            "Shadow senior auditors during client meetings"),
                    l("Student in accounting, finance or a related field",
                            "Good Excel skills",
                            "Basic understanding of auditing concepts",
                            "Knowledge of accounting or bookkeeping is a plus"),
                    l("Auditing", "Excel"),
                    l("Accounting", "Bookkeeping")),

            p("FIN-05", "balkanledger", CAT_FIN, "Bookkeeper", JOB, HYBRID, "Kumanovo", 45,
                    "Manage the day-to-day accounting records of a portfolio of small business clients. You will be the reliable point of contact "
                            + "for invoices, payments and monthly closings.",
                    l("Record transactions and maintain ledgers",
                            "Prepare VAT and monthly closing documentation",
                            "Reconcile bank statements and accounts",
                            "Produce periodic financial reports for clients"),
                    l("Proven experience in bookkeeping and accounting",
                            "Very good Excel skills",
                            "Attention to detail and respect for deadlines",
                            "Experience with financial reporting is a plus"),
                    l("Bookkeeping", "Accounting", "Excel"),
                    l("Financial Reporting")),

            p("FIN-06", "meridian", CAT_FIN, "Budget & Planning Analyst", JOB, HYBRID, "Skopje", 55,
                    "Own the budgeting and forecasting process for our portfolio clients. You will turn financial data into clear plans and "
                            + "recommendations that leadership can act on.",
                    l("Lead annual budgeting and rolling forecast cycles",
                            "Analyse variances between planned and actual results",
                            "Build dashboards and models in Excel",
                            "Present findings and recommendations to clients"),
                    l("2+ years of experience in budgeting or financial planning",
                            "Strong financial analysis and Excel skills",
                            "Good communication skills",
                            "Knowledge of financial reporting or SQL is a plus"),
                    l("Budgeting", "Financial Analysis", "Excel"),
                    l("Financial Reporting", "SQL")),

            p("FIN-07", "northgate", CAT_FIN, "Accounting Intern", INTERNSHIP, ON_SITE, "Stip", 30,
                    "Support our finance department with accounts payable, receivable and daily bookkeeping tasks. "
                            + "A great opportunity to see how accounting works inside a growing logistics company.",
                    l("Enter and verify invoices and payments",
                            "Maintain bookkeeping records and supporting documents",
                            "Assist with month-end closing activities",
                            "Prepare simple reports in Excel"),
                    l("Student of accounting, finance or economics",
                            "Basic knowledge of accounting and bookkeeping",
                            "Working knowledge of Excel",
                            "Interest in budgeting is a plus"),
                    l("Accounting", "Bookkeeping"),
                    l("Excel", "Budgeting")),

            p("FIN-08", "vertex", CAT_FIN, "Financial Data Analyst", JOB, REMOTE, "Remote", 60,
                    "Combine finance and data skills to deliver insights for our clients' finance teams. You will extract, clean and analyse "
                            + "financial data and build clear reports.",
                    l("Query financial data with SQL",
                            "Build analyses and reports in Excel",
                            "Automate recurring analyses with Python and Pandas",
                            "Explain results to non-technical stakeholders"),
                    l("Strong foundation in financial analysis",
                            "Good SQL and Excel skills",
                            "Experience with Python, Pandas or financial reporting is a plus"),
                    l("Financial Analysis", "SQL", "Excel"),
                    l("Python", "Pandas", "Financial Reporting")),

            // ============================================================ Marketing & Sales
            p("MKT-01", "pulse", CAT_MKT, "SEO Specialist", JOB, HYBRID, "Skopje", 45,
                    "Grow the organic visibility of our clients' websites. You will plan and execute search strategies "
                            + "and measure their impact with data.",
                    l("Run keyword research and on-page optimisation",
                            "Create SEO-friendly content briefs with the writing team",
                            "Track rankings and traffic in Google Analytics",
                            "Report results and recommend next steps to clients"),
                    l("Experience with SEO and search best practices",
                            "Good knowledge of Google Analytics",
                            "Strong content writing skills",
                            "Experience with market research is a plus"),
                    l("SEO", "Google Analytics", "Content Writing"),
                    l("Market Research")),

            p("MKT-02", "pulse", CAT_MKT, "Social Media Marketing Intern", INTERNSHIP, HYBRID, "Skopje", 28,
                    "Help us manage social media channels for a range of brands. You will plan content, write posts "
                            + "and learn how campaigns are measured.",
                    l("Plan and schedule posts across social platforms",
                            "Write engaging captions and short-form content",
                            "Monitor engagement and report weekly results",
                            "Support campaign ideas and brainstorming"),
                    l("Active interest in social media and digital marketing",
                            "Good writing skills",
                            "Basic understanding of social media marketing",
                            "Knowledge of copywriting or Google Analytics is a plus"),
                    l("Social Media Marketing", "Content Writing"),
                    l("Copywriting", "Google Analytics")),

            p("MKT-03", "pulse", CAT_MKT, "Content Marketing Writer", JOB, REMOTE, "Remote", 60,
                    "Write articles, landing pages and campaign copy that engage readers and rank well in search. "
                            + "You will work with strategists and designers across several brands.",
                    l("Write blog articles, landing pages and email copy",
                            "Apply SEO best practices to every piece",
                            "Develop a consistent tone of voice for each brand",
                            "Repurpose content for social media"),
                    l("Excellent writing skills and a portfolio of published work",
                            "Strong copywriting and content writing experience",
                            "Good understanding of SEO",
                            "Experience in social media marketing is a plus"),
                    l("Content Writing", "Copywriting", "SEO"),
                    l("Social Media Marketing")),

            p("MKT-04", "brightwave", CAT_MKT, "Sales Development Representative", JOB, ON_SITE, "Skopje", 40,
                    "Identify and qualify new business opportunities for our B2B partnerships. You will be the first point of contact "
                            + "for prospective clients and work closely with our account executives.",
                    l("Research target companies and decision makers",
                            "Reach out to prospects and book qualified meetings",
                            "Maintain accurate records of conversations and leads",
                            "Meet monthly pipeline goals"),
                    l("Proven interest or experience in sales",
                            "Good market research skills",
                            "Confident communication and public speaking",
                            "Experience with email marketing is a plus"),
                    l("Sales", "Market Research"),
                    l("Email Marketing", "Public Speaking")),

            p("MKT-05", "brightwave", CAT_MKT, "Email Marketing Specialist", JOB, REMOTE, "Remote", 50,
                    "Own our email programs from strategy to measurement. You will design campaigns and automated flows that turn "
                            + "subscribers into loyal customers.",
                    l("Plan, write and send email campaigns",
                            "Build and optimise automated lifecycle flows",
                            "Run A/B tests and analyse results in Google Analytics",
                            "Segment audiences to improve relevance"),
                    l("Hands-on experience in email marketing",
                            "Strong copywriting skills",
                            "Good knowledge of Google Analytics",
                            "SEO knowledge is an advantage"),
                    l("Email Marketing", "Copywriting", "Google Analytics"),
                    l("SEO")),

            p("MKT-06", "brightwave", CAT_MKT, "Sales Intern", INTERNSHIP, ON_SITE, "Tetovo", 30,
                    "Start your sales career with a hands-on internship in our retail and online sales team. "
                            + "You will learn the full sales process while working with real customers.",
                    l("Support the sales team with customer inquiries and offers",
                            "Follow up on leads and update customer records",
                            "Help prepare sales presentations",
                            "Gather feedback from customers and report on it"),
                    l("Motivation to build a career in sales",
                            "Good communication skills",
                            "Public speaking or market research experience is a plus"),
                    l("Sales"),
                    l("Public Speaking", "Market Research")),

            p("MKT-07", "pulse", CAT_MKT, "Market Research Analyst Intern", INTERNSHIP, HYBRID, "Skopje", 33,
                    "Support our strategy team with research that shapes our clients' marketing decisions. You will gather, analyse and "
                            + "present data about markets and audiences.",
                    l("Collect and structure market and competitor data",
                            "Analyse survey results and web analytics",
                            "Prepare summaries and slides for client meetings",
                            "Assist with audience and trend research"),
                    l("Analytical mindset and attention to detail",
                            "Good Excel skills",
                            "Basic knowledge of Google Analytics and market research",
                            "Basic SQL is a plus"),
                    l("Market Research", "Excel", "Google Analytics"),
                    l("SQL")),

            p("MKT-08", "brightwave", CAT_MKT, "E-commerce Growth Marketer", JOB, HYBRID, "Skopje", 55,
                    "Drive traffic and revenue for our online stores. You will own acquisition channels and continuously test new ideas "
                            + "to improve conversion.",
                    l("Plan and run SEO and email campaigns",
                            "Analyse funnels and customer behaviour in Google Analytics",
                            "Coordinate social media promotion with the content team",
                            "Work with sales to align offers and promotions"),
                    l("Experience in digital marketing for e-commerce",
                            "Strong knowledge of Google Analytics, SEO and email marketing",
                            "Experience with social media marketing or sales is a plus"),
                    l("Google Analytics", "SEO", "Email Marketing"),
                    l("Social Media Marketing", "Sales")),

            // ============================================================ Design & Creative
            p("DES-01", "pixelforge", CAT_DES, "UI/UX Designer", JOB, HYBRID, "Skopje", 50,
                    "Design intuitive digital products for web and mobile. You will take projects from research and wireframes to polished, "
                            + "developer-ready interfaces.",
                    l("Conduct user research and translate insights into designs",
                            "Create wireframes, prototypes and UI in Figma",
                            "Maintain and extend design systems",
                            "Work closely with developers during implementation"),
                    l("A portfolio showing UI/UX design projects",
                            "Advanced Figma skills",
                            "Solid understanding of UX principles",
                            "Experience in graphic design is a plus"),
                    l("UI/UX Design", "Figma"),
                    l("Graphic Design")),

            p("DES-02", "pixelforge", CAT_DES, "UI/UX Design Intern", INTERNSHIP, HYBRID, "Skopje", 30,
                    "Learn product design in a real studio environment. You will contribute to client projects and receive regular feedback "
                            + "from senior designers.",
                    l("Create wireframes and screens in Figma",
                            "Help prepare user tests and summarise findings",
                            "Assist with design system components",
                            "Present your work in weekly design reviews"),
                    l("Student or self-taught designer with a small portfolio",
                            "Basic Figma skills and understanding of UI/UX design",
                            "Interest in Graphic Design or Photoshop is a plus"),
                    l("Figma", "UI/UX Design"),
                    l("Graphic Design", "Photoshop")),

            p("DES-03", "pixelforge", CAT_DES, "Graphic Designer", JOB, ON_SITE, "Skopje", 45,
                    "Create visual identities, campaign materials and marketing assets for a variety of clients. "
                            + "You will balance creativity with the practical needs of print and digital.",
                    l("Design logos, brand materials and marketing collateral",
                            "Prepare files for print and digital production",
                            "Retouch and edit photography",
                            "Collaborate with copywriters and marketers"),
                    l("Strong portfolio in graphic design",
                            "Advanced skills in Photoshop and Illustrator",
                            "Good sense of typography and layout",
                            "Figma experience is a plus"),
                    l("Graphic Design", "Photoshop", "Illustrator"),
                    l("Figma")),

            p("DES-04", "pixelforge", CAT_DES, "Video Editor", JOB, REMOTE, "Remote", 55,
                    "Edit videos for brand campaigns, product demos and social media. You will shape raw footage into clear, "
                            + "engaging stories.",
                    l("Edit and colour-correct video footage",
                            "Add motion graphics, titles and sound",
                            "Adapt videos for different platforms and formats",
                            "Deliver projects on time and incorporate feedback"),
                    l("Proven experience in video editing and a portfolio or showreel",
                            "Good sense of pacing and storytelling",
                            "Skills in Photoshop or Illustrator are a plus"),
                    l("Video Editing"),
                    l("Photoshop", "Illustrator", "Social Media Marketing")),

            p("DES-05", "pulse", CAT_DES, "Creative Design Intern (Social Media Visuals)", INTERNSHIP, HYBRID, "Skopje", 28,
                    "Design eye-catching visuals for the social channels of our clients. You will work next to our marketing team "
                            + "and see your designs go live every week.",
                    l("Create graphics, banners and carousels for social media",
                            "Edit and retouch images in Photoshop",
                            "Produce short video clips and animations",
                            "Follow brand guidelines and give feedback to the team"),
                    l("A small portfolio of graphic design work",
                            "Basic skills in Graphic Design and Photoshop",
                            "Interest in video editing and social media marketing is a plus"),
                    l("Graphic Design", "Photoshop"),
                    l("Video Editing", "Social Media Marketing")),

            p("DES-06", "novabyte", CAT_DES, "Product Designer", JOB, REMOTE, "Remote", 60,
                    "Shape the user experience of our client products from the first concept to the final interface. "
                            + "You will work in a cross-functional team with engineers and product managers.",
                    l("Define user flows and interaction design",
                            "Design interfaces and prototypes in Figma",
                            "Validate ideas with users and iterate on feedback",
                            "Hand over designs to developers using HTML and CSS-aware practices"),
                    l("Strong portfolio of product or web design",
                            "Advanced UI/UX design and Figma skills",
                            "Basic understanding of HTML, CSS or Tailwind CSS is an advantage"),
                    l("UI/UX Design", "Figma"),
                    l("HTML", "CSS", "Tailwind CSS")),

            p("DES-07", "pixelforge", CAT_DES, "Brand Identity Designer", JOB, HYBRID, "Ohrid", 50,
                    "Build memorable brand identities for startups, hotels and restaurants. You will lead projects from concept to final "
                            + "brand guidelines.",
                    l("Develop logos, colour palettes and typography systems",
                            "Create vector illustrations and iconography",
                            "Produce brand guidelines and application mockups",
                            "Present concepts to clients"),
                    l("Strong portfolio with brand identity projects",
                            "Advanced Illustrator and graphic design skills",
                            "Photoshop and Figma skills are a plus"),
                    l("Illustrator", "Graphic Design"),
                    l("Photoshop", "Figma")),

            p("DES-08", "brightwave", CAT_DES, "Motion & Video Intern", INTERNSHIP, ON_SITE, "Skopje", 33,
                    "Produce product videos and short ads for our online stores. You will learn the full video workflow in a "
                            + "fast-moving in-house creative team.",
                    l("Edit product and promotional videos",
                            "Prepare thumbnails and visuals in Photoshop",
                            "Help plan and shoot short content",
                            "Support the marketing team with creative assets"),
                    l("Basic video editing skills and a few sample projects",
                            "Working knowledge of Photoshop",
                            "Interest in graphic design is a plus"),
                    l("Video Editing", "Photoshop"),
                    l("Graphic Design")),

            // ============================================================ Business & Management
            p("BUS-01", "orbit", CAT_BUS, "Junior Project Manager", JOB, HYBRID, "Skopje", 45,
                    "Coordinate client projects from kick-off to delivery. You will keep teams aligned, timelines realistic and "
                            + "stakeholders informed.",
                    l("Plan project scope, milestones and resources",
                            "Run daily and weekly team meetings",
                            "Track risks, issues and progress",
                            "Report status to clients and leadership"),
                    l("Basic project management experience or training",
                            "Strong time management and organisational skills",
                            "Ability to lead and motivate a small team",
                            "Business analysis knowledge is a plus"),
                    l("Project Management", "Time Management", "Team Leadership"),
                    l("Business Analysis")),

            p("BUS-02", "orbit", CAT_BUS, "Business Analyst", JOB, HYBRID, "Skopje", 55,
                    "Bridge the gap between business needs and delivery teams. You will analyse processes, define requirements and "
                            + "support the implementation of improvements.",
                    l("Gather and document business requirements",
                            "Analyse data with SQL to support decisions",
                            "Map and improve business processes",
                            "Work with project managers and technical teams"),
                    l("Experience in business analysis",
                            "Good SQL skills",
                            "Excellent analytical and communication skills",
                            "Project management or Excel knowledge is a plus"),
                    l("Business Analysis", "SQL"),
                    l("Project Management", "Excel")),

            p("BUS-03", "orbit", CAT_BUS, "Business Analyst Intern", INTERNSHIP, ON_SITE, "Skopje", 30,
                    "Learn business analysis on real client engagements. You will help our analysts collect information, "
                            + "structure it and present clear findings.",
                    l("Collect and organise process and requirements information",
                            "Analyse data in Excel",
                            "Prepare presentations and summaries",
                            "Take notes and follow up in client workshops"),
                    l("Student in business, economics, IT or a related field",
                            "Basic business analysis knowledge and good Excel skills",
                            "SQL or public speaking skills are a plus"),
                    l("Business Analysis", "Excel"),
                    l("SQL", "Public Speaking")),

            p("BUS-04", "northgate", CAT_BUS, "Customer Support Specialist", JOB, REMOTE, "Remote", 40,
                    "Be the voice of Northgate for our customers. You will answer questions, solve delivery issues and make sure "
                            + "every customer feels looked after.",
                    l("Respond to customer enquiries by phone, chat and email",
                            "Track shipments and resolve delivery problems",
                            "Document issues and escalate when needed",
                            "Share customer feedback with the operations team"),
                    l("Experience in customer support or a service role",
                            "Excellent time management and communication",
                            "Public speaking or email marketing knowledge is a plus"),
                    l("Customer Support", "Time Management"),
                    l("Public Speaking", "Email Marketing")),

            p("BUS-05", "northgate", CAT_BUS, "Operations Coordinator", JOB, ON_SITE, "Stip", 50,
                    "Keep our daily logistics operations on track. You will coordinate schedules, teams and deliveries to meet our service promises.",
                    l("Plan and coordinate daily dispatch and warehouse activities",
                            "Monitor performance and report KPIs",
                            "Solve operational issues quickly",
                            "Work with drivers, warehouse staff and customers"),
                    l("Experience in project or operations coordination",
                            "Strong time management skills",
                            "Team leadership experience and Excel skills are a plus"),
                    l("Project Management", "Time Management"),
                    l("Excel", "Team Leadership")),

            p("BUS-06", "orbit", CAT_BUS, "Project Management Intern", INTERNSHIP, HYBRID, "Skopje", 32,
                    "Join our delivery team and learn how projects are managed in practice. You will assist project managers "
                            + "with planning, tracking and reporting.",
                    l("Maintain project plans and task boards",
                            "Prepare meeting notes and status reports",
                            "Follow up on actions with team members",
                            "Support risk and issue tracking"),
                    l("Student with an interest in project management",
                            "Good organisation and time management",
                            "Business analysis knowledge is a plus"),
                    l("Project Management", "Time Management"),
                    l("Business Analysis")),

            p("BUS-07", "northgate", CAT_BUS, "Customer Success Intern", INTERNSHIP, REMOTE, "Remote", 28,
                    "Help our customers get the most from our services. You will support the customer team, learn how to talk to clients "
                            + "and become part of our service culture.",
                    l("Answer customer questions and follow up on requests",
                            "Prepare simple reports about customer feedback",
                            "Join calls with clients and take notes",
                            "Help improve our help-centre content"),
                    l("Friendly and patient communication style",
                            "Interest in customer support and public speaking",
                            "Good time management is a plus"),
                    l("Customer Support", "Public Speaking"),
                    l("Time Management")),

            p("BUS-08", "orbit", CAT_BUS, "Team Lead, Delivery", JOB, ON_SITE, "Skopje", 65,
                    "Lead a team of consultants delivering client programs. You will be responsible for outcomes, people and relationships.",
                    l("Lead and coach a team of 5-8 consultants",
                            "Oversee project delivery, budgets and timelines",
                            "Present results to senior client stakeholders",
                            "Contribute to hiring and team development"),
                    l("3+ years of experience including team leadership",
                            "Strong project management skills",
                            "Excellent public speaking and presentation abilities",
                            "Business analysis knowledge is an advantage"),
                    l("Team Leadership", "Project Management", "Public Speaking"),
                    l("Business Analysis"))
    );
}
