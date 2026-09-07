---
description: List Monta teams with type, currency, frozen state, and site or charge point counts
argument-hint: "[operator ID or name filter]"
---

List teams from the Monta API. Read-only.

Arguments: `$ARGUMENTS` (optional operator ID or a text filter on team name).

1. If the connection has not been verified in this session, call `get-current-consumer` first. If it fails, follow the `setup` skill instead. Note whether the credential is restricted to specific `teamIds`.
2. Call `get-teams` with `perPage: 100` (and `operatorId` if a number was given). Page through while more pages remain, up to 500 teams; beyond that report the total and ask for a filter.
3. Filter locally by name if a text filter was given.
4. For up to 25 teams, call `get-sites` with `teamId` and `perPage: 1` and read `meta.totalItemCount` for the site count. Skip this step for larger lists and say so.
5. Present a table: ID, name, type, currency, frozen (with reason if set), sites, created. End with totals and the number of frozen teams.
6. Offer `/monta:sites <team>` or `/monta:charge-points <team>` for detail. Do not create, patch, freeze, or delete anything from this command.
