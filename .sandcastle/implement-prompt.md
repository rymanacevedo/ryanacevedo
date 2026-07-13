# TASK

Use `$caveman full` for every response during this run. Keep code, commands,
commit messages, issue comments, and error text in their normal technical form.

Fix issue {{TASK_ID}}: {{ISSUE_TITLE}}

Pull in the issue, including its comments and labels:

`gh issue view <ID> --comments --json number,title,body,labels,comments --jq '{number, title, body, labels: [.labels[].name], comments: [.comments[].body]}'`

If it has a parent PRD, read that issue with the same fields.

Only work on the issue specified.

Work on branch {{BRANCH}}. Make commits and run tests.

The provided workspace and branch are the synchronization boundary. Do not
clone the repository into `/tmp` and do not run `git push`. If the workspace or
Git metadata is not writable, report the infrastructure blocker and stop.

# CONTEXT

Here are the last 10 commits:

<recent-commits>

!`git log -n 10 --format="%H%n%ad%n%B---" --date=short`

</recent-commits>

# EXPLORATION

Explore the repo and fill your context window with relevant information that will allow you to complete the task.

Pay extra attention to test files that touch the relevant parts of the code.

# EXECUTION

If applicable, use RGR to complete the task.

1. RED: write one test
2. GREEN: write the implementation to pass that test
3. REPEAT until done
4. REFACTOR the code

# FEEDBACK LOOPS

Before committing, run `bun run lint`, `bun run typecheck`, `bun test`, and
`bun run build`. Fix failures before committing.

# COMMIT

Make a git commit. The commit message must:

1. Start with `RALPH:` prefix
2. Include task completed + PRD reference
3. Key decisions made
4. Files changed
5. Blockers or notes for next iteration

Keep it concise.

# THE ISSUE

If the task is not complete, leave a comment on the issue with what was done.

Do not close the issue - this will be done later.

Once complete, output <promise>COMPLETE</promise>.

# FINAL RULES

ONLY WORK ON A SINGLE TASK.
