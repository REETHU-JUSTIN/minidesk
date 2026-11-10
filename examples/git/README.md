# Git: Branching and Pull Requests

**Tested:** every command in the walkthrough below ran in a throwaway repository, including the merge conflict. MiniDesk's own history so far is a single `main` branch with one commit per phase.

## Try it safely

Run this in an empty folder outside MiniDesk:

```bash
git init git-practice && cd git-practice
echo "# Practice" > README.md
git add README.md && git commit -m "Initial commit"
git branch -M main
```

---

## Branching and Merging

### 1. Concept Explanation

A **branch** is a separate line of work. You make changes there without affecting `main`, then **merge** them back when they're ready. A branch is just a pointer to a commit, so creating one is instant.

A **merge conflict** happens when two branches change the same lines. Git can't choose between them, so it asks you to.

### 2. Project Implementation

In a team, each MiniDesk phase would have been its own branch, such as `feature/redux-toolkit`, merged into `main` through a pull request after review.

### 3. Code Reference

**File:** [examples/git/README.md](README.md)

```bash
git switch -c feature/ticket-priority
```

```bash
git switch main
git merge feature/ticket-priority
```

```bash
git add README.md
git commit -m "Merge feature/ticket-priority, keeping both changes"
```

- `git switch -c` creates a branch and moves to it.
- The merge brings the branch's commits into `main`.
- After fixing a conflict, `git add` marks it resolved, and `git commit` finishes the merge.

The full walkthrough:

```bash
# 1. Start a feature on its own branch
git switch -c feature/ticket-priority
echo "Priority: high" >> README.md
git commit -am "Add ticket priority"

# 2. Meanwhile, someone changes the same line on main
git switch main
echo "Priority: low" >> README.md
git commit -am "Set default priority"

# 3. Merging now causes a conflict
git merge feature/ticket-priority
# CONFLICT (content): Merge conflict in README.md

# 4. Open README.md. Git has marked both versions:
#    <<<<<<< HEAD
#    Priority: low
#    =======
#    Priority: high
#    >>>>>>> feature/ticket-priority
#    Edit the file to what it should be, and delete the marker lines.

# 5. Finish the merge
git add README.md
git commit -m "Merge feature/ticket-priority, keeping both changes"

# 6. Delete the finished branch
git branch -d feature/ticket-priority
```

### 4. Why Use It

`main` always stays working, several features can progress at once, and each change can be reviewed on its own before it's combined.

### 5. Real-Time Scenario

You're building ticket priorities while a teammate fixes a login bug. Each works on a branch. The login fix merges first. When your branch merges, Git combines both automatically, unless you both edited the same lines. In that case you resolve the conflict, then merge.

### 6. Interview Questions

- **Theory:** What's the difference between merge and rebase?
- **Theory:** What causes a merge conflict, and how do you resolve one?
- **Theory:** What's the difference between `git fetch` and `git pull`?
- **Practical:** Describe your branching strategy.

### 7. Project-Based Answers

**Merge versus rebase?**
A merge combines branches with a merge commit and keeps history as it happened. A rebase replays your commits on top of the other branch, giving a straight line of history. Don't rebase commits that others have already pulled, because it rewrites them.

**Merge conflicts?**
They happen when both branches change the same lines. Git marks both versions in the file. I edit it to the correct result, remove the markers, then `git add` and commit. I practiced this in the walkthrough above.

**`fetch` versus `pull`?**
`fetch` downloads new commits without changing your files. `pull` is a fetch followed by a merge, or a rebase if configured.

**Your branching strategy?**
On MiniDesk, I worked alone and committed each phase to `main`, with clear messages. In a team, I'd use short-lived feature branches from `main`, opened as pull requests, with tests run automatically before merging.

### 8. Follow-up Questions

- **How do you undo a commit that's already pushed?** `git revert`, which adds a new commit undoing it, so shared history isn't rewritten.
- **What is `git stash`?** It temporarily stores uncommitted changes, so you can switch branches with a clean working folder.
- **What should never be committed?** Secrets, and generated files like `node_modules`. MiniDesk's `.gitignore` excludes `.env` files for that reason.

---

## Pull Requests

### 1. Concept Explanation

A **pull request** (PR) asks to merge a branch into another, usually `main`. It's where teammates review the changes, discuss them, and see automated test results before anything is merged.

### 2. Project Implementation

MiniDesk doesn't have pull requests, because it was built alone on `main`. The [CI/CD example](../ci-cd/README.md) shows the tests that would run automatically on each one.

### 3. Code Reference

**File:** [examples/git/README.md](README.md)

```bash
git push -u origin feature/ticket-priority
```

- This pushes the branch to GitHub. GitHub then offers to open a pull request, or you can use **Pull requests > New pull request**.

### 4. Why Use It

A second person catches mistakes, shares knowledge of the code, and keeps a written record of why each change was made.

### 5. Real-Time Scenario

You open a PR titled "Add ticket priority filter". CI runs the tests and they pass. A reviewer asks you to add a test for an empty result, so you push another commit to the same branch, and the PR updates. After approval, it's merged and the branch is deleted.

### 6. Interview Questions

- **Theory:** What makes a good pull request?
- **Practical:** How do you handle review feedback you disagree with?

### 7. Project-Based Answers

**What makes a good pull request?**
Small and focused on one change, with a description of what and why, how it was tested, and screenshots for UI changes. My MiniDesk commit messages follow the same idea: a summary line, then the reasons.

**Disagreeing with feedback?**
Explain my reasoning, with evidence where possible, like a test or a benchmark, and stay open to being wrong. If it's a matter of style, follow the team's convention.

### 8. Follow-up Questions

- **Squash merge or merge commit?** Squashing turns the PR into one commit, for a tidy `main`. A merge commit keeps every commit. Teams choose one and stay consistent.
- **What is branch protection?** GitHub settings that require reviews or passing tests before merging into `main`.
- **What is a draft PR?** A PR marked as not ready, to share work early for feedback.
