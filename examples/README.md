# MiniDesk Practice Examples

Small, separate examples of technologies around MiniDesk, including the SQL it used before moving to MongoDB. Each one connects back to MiniDesk, so you can compare approaches in an interview.

Nothing in this folder affects the MiniDesk application.

| Example | What it covers | Tested |
|---|---|---|
| [MongoDB](mongodb/README.md) | CRUD and aggregation pipelines | Yes, on a temporary MongoDB server |
| [PostgreSQL](postgresql/README.md) | MiniDesk's original SQL schema and queries, CTEs, functions, triggers and procedures | Yes, on a copy of the original schema |
| [TypeScript](typescript/INTERVIEW_NOTES.md) | Notes from MiniDesk's earlier TypeScript version | Yes, it was the working version before the JavaScript conversion |
| [Git](git/README.md) | Branching, merging, conflicts and pull requests | Yes, in a throwaway repository |
| [CI/CD](ci-cd/README.md) | A GitHub Actions workflow for MiniDesk | Its steps were run locally, but not on GitHub |
| [Docker](docker/README.md) | Images, containers, volumes and networks | No, Docker wasn't installed |
| [AWS](aws/README.md) | How MiniDesk would run on AWS | No, no AWS account was used |
| [Agile and Scrum](agile/README.md) | MiniDesk planned as user stories and sprints | Not applicable |

Each example's notes follow the same eight-part format as the [interview guide](../docs/INTERVIEW_QUESTIONS.md).
