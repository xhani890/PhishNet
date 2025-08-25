## ANEXAS-311 — Database: related created sub-tasks

This file records the DB subtasks created to support email open/click tracking and landing page capture for ANEXAS-311.

Created sub-tasks (under ANEXAS-93 Database):

- ANEXAS-325 — DB: add getCampaignResultByCampaignAndTarget helper
- ANEXAS-326 — DB: add index on (campaign_id, target_id)
- ANEXAS-327 — DB: add unit + integration tests for tracking endpoints
- ANEXAS-328 — DB: add migration + rollback scripts for campaign_results changes
- ANEXAS-329 — DB: implement HMAC signing for tracking links
- ANEXAS-330 — DB: add rate-limiting and observability for tracking endpoints

Related earlier created Tasks (not sub-tasks):

- ANEXAS-319 .. ANEXAS-324 — DB tasks created earlier and assigned to Furqan

Linking plan
- These sub-tasks are linked to ANEXAS-311 in Jira as related items (ANEXAS-311 is the day-1 subtask that coordinates DB work). If you prefer a different link type (blocks/is blocked by), update in Jira.

PR summary (this branch)

This branch adds a short doc listing the new Jira sub-tasks and context. It accompanies the work tracked in Jira:

- Adds `docs/ANEXAS-311-db-subtasks.md` with the created task keys and short descriptions.

Acceptance / Next steps
- Merge this PR to record the task list in the repo.
- Implementation work for the tasks will be delivered in targeted feature branches with code, tests, and migrations.
