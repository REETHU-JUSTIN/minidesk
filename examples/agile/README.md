# Agile and Scrum

MiniDesk was built in phases by one person, so it wasn't a real Scrum project. This shows how a team would plan the same work with Scrum, using MiniDesk's actual features.

## The product backlog as user stories

User stories describe a need from a user's point of view: *As a [role], I want [goal], so that [reason].*

| ID | User story | Points | Acceptance criteria |
|---|---|---|---|
| MD-1 | As a customer, I want to create an account, so that I can raise tickets | 3 | Email must be unique. The password is at least 8 characters. The account is always a customer |
| MD-2 | As a user, I want to sign in, so that I can see my tickets | 3 | A wrong password shows one general message. Repeated failures are rate limited |
| MD-3 | As a customer, I want to create a ticket, so that I can report a problem | 3 | Title 5–120 characters. Description at least 10 characters. Starts open and unassigned |
| MD-4 | As a customer, I want to see only my tickets, so that other people's data stays private | 5 | Another customer's ticket returns "not found" |
| MD-5 | As an agent, I want to assign a ticket to myself, so that the team knows who's handling it | 2 | Agents can assign only themselves. Admins can assign anyone |
| MD-6 | As an agent, I want to change a ticket's status, so that customers can see progress | 2 | Only agents and admins can change it |
| MD-7 | As a user, I want to comment on a ticket, so that I can talk with the other person | 3 | The author comes from the signed-in account |
| MD-8 | As an agent, I want to search and filter tickets, so that I can find work quickly | 5 | Search title, filter by status and priority, and page through results |
| MD-9 | As an admin, I want a dashboard, so that I can see the overall workload | 3 | Counts by status, and the 5 most recent tickets |
| MD-10 | As an admin, I want to delete a ticket, so that duplicates can be removed | 1 | Comments are deleted too. Admins only |

**Story points** estimate relative effort, not hours. MD-4 is a 5 because it needs checks in every query, plus tests.

## Two-week sprints

| Sprint | Goal | Stories |
|---|---|---|
| 1 | Customers can sign up, sign in and raise tickets | MD-1, MD-2, MD-3 |
| 2 | Customers and agents work tickets together | MD-4, MD-5, MD-6, MD-7 |
| 3 | Agents and admins can manage the workload | MD-8, MD-9, MD-10 |

## Definition of done

A story is done only when all of these are true:
- The code is reviewed and merged.
- Tests cover it, and CI passes.
- It works for each role it affects.
- Validation runs on both the frontend and the API.
- The documentation is updated.

---

## Scrum

### 1. Concept Explanation

**Agile** is a set of values: deliver working software often, respond to change, and work closely with users. **Scrum** is one framework for doing that, using fixed-length **sprints**, usually 1 to 4 weeks.

| Roles | Events | Artifacts |
|---|---|---|
| **Product Owner:** decides what's most valuable | **Sprint Planning:** choose the sprint's goal and stories | **Product backlog:** everything wanted, in priority order |
| **Scrum Master:** helps the team work well, and removes obstacles | **Daily Scrum:** a 15-minute sync on progress and blockers | **Sprint backlog:** the work chosen for this sprint |
| **Developers:** build the increment | **Sprint Review:** show the result to stakeholders | **Increment:** working software that meets the definition of done |
| | **Retrospective:** improve how the team works | |

### 2. Project Implementation

MiniDesk's 11 phases worked like short iterations. Each had a goal, a working result, a check before moving on, and a review where you decided whether to continue. The backlog above turns that into Scrum terms.

### 3. Code Reference

**File:** [backend/tests/tickets.test.ts](../../backend/tests/tickets.test.ts)

```ts
it('makes another customer\'s ticket look the same as a missing one', async () => {
```

- This test is MD-4's acceptance criterion, written as code. Acceptance criteria that become automated tests are a strong part of a definition of done.

### 4. Why Use It

Requirements change, and big plans made in advance tend to be wrong. Short cycles get working software in front of users sooner, so the team learns and adjusts early.

### 5. Real-Time Scenario

In MiniDesk's Sprint 2 review, the product owner sees that customers can view other people's tickets by changing the URL. It's added to the backlog as a high-priority bug. In the retrospective, the team agrees to write permission tests for every new endpoint.

### 6. Interview Questions

- **Theory:** What's the difference between Agile and Scrum?
- **Theory:** What happens in each Scrum event?
- **Theory:** What are story points, and why not estimate in hours?
- **Practical:** Have you worked in an Agile way?
- **Practical:** What is a definition of done?

### 7. Project-Based Answers

**Agile versus Scrum?**
Agile is the philosophy. Scrum is a specific framework, with roles, events and sprints. Kanban is another Agile approach, based on continuous flow rather than sprints.

**What happens in each event?**
Planning picks the sprint goal and stories. The daily scrum keeps everyone in sync. The review shows the working result to stakeholders. The retrospective improves the process.

**Story points?**
Relative effort, which includes complexity and uncertainty. People are better at comparing tasks than predicting hours, and a team's average points per sprint, its velocity, helps it plan.

**Have you worked in an Agile way?**
On MiniDesk, I worked in short phases, each with a clear goal, a working result I could demonstrate, and a check before moving on. I adjusted the plan as I learned, such as adding rate limiting once deployment came into view. I haven't been on a formal Scrum team.

**What is a definition of done?**
A shared checklist every story must meet before it counts as finished, so "done" means the same thing to everyone. Mine includes tests, review and updated documentation.

### 8. Follow-up Questions

- **What if a story doesn't finish in a sprint?** It goes back to the product backlog to be re-prioritized. It isn't counted as partly done.
- **Scrum or Kanban?** Scrum suits planned feature work in cycles. Kanban suits continuous incoming work, like support tickets, which MiniDesk itself manages.
- **What is a spike?** A short, time-boxed investigation to reduce uncertainty before estimating, such as "try three ways to deploy".
