---
description: List Monta charge points with their current state, optionally filtered by site, team, or state
argument-hint: "[site name or ID] [state]"
---

List charge points from the Monta Partner API and summarise their state. Read-only.

Arguments: `$ARGUMENTS` (a site name or ID, a team ID, and/or a state such as `available`, `busy-charging`, `error`, or `disconnected`; all optional).

1. If the connection has not been verified in this session, call `get-current-consumer` first. If it fails, follow the `setup` skill instead.
2. Resolve the filter. A number is a `siteId` (check with `get-site`; if that 404s, treat it as `teamId`). A name is matched against `get-sites` (`perPage: 100`); ask if several sites match. A state word becomes the `state` filter.
3. Call `get-charge-points` with the resolved filters and `perPage: 100`. Use `meta.totalItemCount` for the total and page only if the user needs everything.
4. Present a table: ID, name, serial number, site, state, connectors, last connected (in the user's timezone, say which). Then a one-line summary of the state distribution (available / busy / error / disconnected / other).
5. Flag chargers in `error` or `disconnected` and offer to investigate with the `monta-charging-operations` workflows. Do not reboot, unlock, or change anything from this command.
