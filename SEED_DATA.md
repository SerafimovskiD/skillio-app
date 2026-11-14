# Skillio demo data

Demo and evaluation data loaded by `DemoDataSeeder` (package `mk.skillio.seed`):
**10 companies, 40 job postings, 20 students.**

All seeded accounts use the reserved domain `example.com`, so no real e-mail can ever be delivered to them.

**Password for every seeded account (students and companies): `Seed12345!`**

## How to load the data

1. Start Docker (PostgreSQL), then the `ai-service` (needed to generate embeddings).
2. Start the backend once normally, so categories and skills are created.
3. Start the backend with the Spring profile `seed`
   (IntelliJ: Run > Edit Configurations > `BackendApplication` > *Active profiles* = `seed`).
4. Look for `[seed] Done. Created 40 postings and 20 students.` in the log.
5. Remove the profile again. Re-running is safe: accounts that already exist are skipped.

## Students

| ID | Name | E-mail | Profile |
|----|------|--------|---------|
| S01 | Stefan Trajkovski | stefan.trajkovski@example.com | Java backend developer |
| S02 | Ivana Stojanovska | ivana.stojanovska@example.com | Frontend React developer |
| S03 | Nikola Dimitrievski | nikola.dimitrievski@example.com | Full-stack JavaScript developer |
| S04 | Elena Ristovska | elena.ristovska@example.com | Machine learning / NLP |
| S05 | Filip Angelovski | filip.angelovski@example.com | DevOps / infrastructure |
| S06 | Sara Kostovska | sara.kostovska@example.com | Financial analyst |
| S07 | Martin Jovanovski | martin.jovanovski@example.com | Accounting and audit |
| S08 | Teodora Nikolovska | teodora.nikolovska@example.com | Junior bookkeeper |
| S09 | Viktor Mitrevski | viktor.mitrevski@example.com | SEO and content marketing |
| S10 | Anastasija Georgievska | anastasija.georgievska@example.com | Social media marketing |
| S11 | David Popovski | david.popovski@example.com | Sales |
| S12 | Katerina Velkovska | katerina.velkovska@example.com | Email and growth marketing |
| S13 | Jana Todorovska | jana.todorovska@example.com | UI/UX design |
| S14 | Luka Spasovski | luka.spasovski@example.com | Graphic and brand design |
| S15 | Bojan Krstevski | bojan.krstevski@example.com | Video editing |
| S16 | Mila Ilievska | mila.ilievska@example.com | Project management |
| S17 | Andrej Markovski | andrej.markovski@example.com | Business analysis |
| S18 | Simona Arsovska | simona.arsovska@example.com | Customer support |
| S19 | Kristijan Zdravkovski | kristijan.zdravkovski@example.com | Borderline: finance + data |
| S20 | Dario Naumovski | dario.naumovski@example.com | Weak / vague profile |

## Companies

| Company | E-mail | Industry | Postings |
|---------|--------|----------|----------|
| NovaByte Labs | novabyte@example.com | Software Development | 4 |
| Stackline Systems | stackline@example.com | IT Services | 3 |
| Vertex Analytics | vertex@example.com | Data & AI | 3 |
| Meridian Capital Partners | meridian@example.com | Financial Services | 3 |
| Balkan Ledger & Audit | balkanledger@example.com | Accounting & Audit | 3 |
| Pulse Digital Agency | pulse@example.com | Digital Marketing | 5 |
| Brightwave Commerce | brightwave@example.com | E-commerce | 5 |
| Pixelforge Studio | pixelforge@example.com | Design Studio | 5 |
| Orbit Consulting Group | orbit@example.com | Management Consulting | 5 |
| Northgate Logistics | northgate@example.com | Logistics & Supply Chain | 4 |

## Postings

40 postings, 8 per category (IT & Software, Finance & Accounting, Marketing & Sales,
Design & Creative, Business & Management), with IDs `IT-01` ... `BUS-08` in `SeedData.java`.
They mix internships and jobs, remote / hybrid / on-site work and several cities.
Deadlines are relative to the day the seeder runs, so the postings do not expire during testing.
