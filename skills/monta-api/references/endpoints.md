# Common tasks and the tools that serve them

Tool names are the Monta API operation IDs. In Claude Code the full name is prefixed with the server name, for example `mcp__monta-api__get-charge-points` (a `plugin_monta_` segment may also appear depending on how the plugin was installed). Safety: **R** read-only, **M** mutating (confirm), **D** destructive (confirm with the concrete target restated).

## Identity and environment

| Task | Tool | Method and path | Safety |
|---|---|---|---|
| Who am I, which operator, teams, scopes, rate limit | `get-current-consumer` | GET /consumers/me | R |
| List operators / sub-operators | `get-operators`, `get-operator-sub-operators` | GET /operators, /operators/{id}/sub-operators | R |

## Teams

| Task | Tool | Method and path | Safety |
|---|---|---|---|
| List teams (filters: `operatorId`, `partnerExternalId`, `ids`, `includeDeleted`) | `get-teams` | GET /teams | R |
| Team details, settings | `get-team`, `get-team-settings` | GET /teams/{id}, /teams/{id}/settings | R |
| Create / edit team | `post-team`, `patch-team` | POST /teams, PATCH /teams/{id} | M |
| Freeze / unfreeze team (blocks charging and payments) | `freeze-team`, `unfreeze-team` | POST /teams/{id}/freeze, /unfreeze | D |
| Delete team | `delete-team` | DELETE /teams/{id} | D |
| Team members list / detail | `getTeamMembers`, `getTeamMember` | GET /team-members | R |
| Invite / bulk invite / accept / reject / patch member | `post-team-member`, `bulk-invite-team-members`, `acceptTeamMemberJoinRequest`, `rejectTeamMemberJoinRequest`, `patchTeamMember` | POST or PATCH /team-members... | M |
| Remove member, transfer ownership | `delete-team-member`, `transferTeamOwnership` | DELETE /team-members/{id}, PATCH .../transfer-ownership | D |

## Sites

| Task | Tool | Method and path | Safety |
|---|---|---|---|
| List sites with charge point counts (filters: `teamId`, `operatorId`, `partnerExternalId`, `includePublic`, `sortByLocation`) | `get-sites` | GET /sites | R |
| Site detail | `get-site` | GET /sites/{siteId} | R |
| Site statistics: energy, sessions, success rate, uptime (`YYYY-MM-DD`, max 31 days) | `get-site-statistics` | GET /charge-point-statistics/by-site | R |
| Create / edit site, amenities, opening hours, energy mix, images | `post-site`, `patch-site`, `update-site-amenities`, `update-site-opening-hours`, `update-site-energy-mix`, `upload-site-image` | POST or PATCH or PUT /sites... | M |
| Delete site / site image | `delete-site`, `delete-site-image` | DELETE /sites/{siteId}, /images | D |

## Charge points

| Task | Tool | Method and path | Safety |
|---|---|---|---|
| List charge points with state (filters: `siteId`, `teamId`, `operatorId`, `state`, `partnerExternalId`, `fromUpdatedDate`, `sortByLocation`) | `get-charge-points` | GET /charge-points | R |
| Charge point detail (state, connectors, firmware, last connected) | `get-charge-point` | GET /charge-points/{chargePointId} | R |
| Charge point logs (OCPP-level messages; `fromDate`, `toDate`, cursor mode up to 1000 per page) | `get-charge-point-logs` | GET /charge-points/{chargePointId}/logs | R |
| Per charge point statistics (`YYYY-MM-DD`, max 31 days) | `get-charge-point-statistics` | GET /charge-point-statistics/by-charge-point | R |
| Network overview of charge point states | `get-dashboard-network-overview` | GET /dashboard-statistics/network-overview | R |
| Network data consumption for a charge point | `get-charge-point-data-consumption` | GET /charge-points/{id}/data-consumption | R |
| Read OCPP configuration (keyed by `chargePointIdentity`) | `get-ocpp-config` | GET /charge-points/{chargePointIdentity}/ocpp-config | R |
| Charging rules list / detail | `get-charge-point-charging-rules`, `get-charge-point-charging-rule` | GET /charge-points/{id}/charging-rules | R |
| Connector types catalogue | `get-connectors`, `get-connector` | GET /charge-point-connectors | R |
| Map view of charge points and sites | `get-charge-point-map` | GET /charge-points/map | R |
| Create / bulk import / edit charge point | `post-charge-point`, `bulk-import-charge-points`, `patch-charge-point` | POST or PATCH /charge-points | M |
| Activate, maintenance on/off, auto-start, sync charge keys, publish settings, charging rules | `activate-charge-point`, `maintenance-on-charge-point`, `maintenance-off-charge-point`, `update-charge-point-auto-start`, `sync-charge-point-keys`, `create-charge-point-publish-settings`, `post-charge-point-charging-rule`, `put-charge-point-charging-rule` | POST or PUT /charge-points/{id}/... | M |
| Reboot / unlock / deactivate charge point | `reboot-charge-point`, `unlock-charge-point`, `deactivate-charge-point` | POST /charge-points/{id}/reboot, /unlock, /deactivate | D |
| Write OCPP configuration | `create-ocpp-config` | POST /charge-points/{chargePointIdentity}/ocpp-config | D |
| Set / clear charging profile (beta, feature flag) | `set-charging-profile`, `clear-charging-profile` | POST /charge-points/{chargePointIdentity}/set-charging-profile, /clear-charging-profile | D |
| Transfer charge point to another team | `transfer-charge-point-to-team` | POST /charge-points/{id}/transfer/teams/{teamId} | D |
| Delete charge point / charging rule | `delete-charge-point`, `delete-charge-point-charging-rule` | DELETE /charge-points/{id}... | D |

## Charges (charging sessions)

| Task | Tool | Method and path | Safety |
|---|---|---|---|
| List charges (filters: `teamId`, `siteId`, `chargePointId`, `state`, `fromDate`, `toDate`, `fromCompletedDate`, `toCompletedDate`, `chargeAuthId`, `partnerExternalId`, `operatorId`) | `get-charges` | GET /charges | R |
| Charge detail (`state`, `rawState`, `consumedKwh`, `price`, `cost`, `failureReason`, `stopReason`) | `get-charge` | GET /charges/{chargeId} | R |
| Price and cost breakdown (hourly components, fees, adjustments) | `get-charge-breakdown` | GET /charges/{chargeId}/breakdown | R |
| kWh consumption curve | `get-charge-kwh-consumption` | GET /charges/{chargeId}/kwh-consumption | R |
| Receipt for a charge | `get-receipt-by-charge` | GET /receipts/by-charge/{chargeId} | R |
| Charges for a user | `get-user-charges` | GET /users/{userId}/charges | R |
| Start a charge (`chargePointId`, `payingTeamId`, optional `kwhLimit`, `socLimit`, `reserveCharge`) | `start-charge` | POST /charges | M |
| Edit a charge (note, external ID) | `patch-charge` | PATCH /charges/{chargeId} | M |
| Stop / restart a charge | `stop-charge`, `restart-charge` | GET /charges/{chargeId}/stop, /restart | D |

## Reports and insights

| Task | Tool | Method and path | Safety |
|---|---|---|---|
| Charger report: sessions and kWh per charge point for a team (`teamId`, `fromDate`, `toDate` required; `chargePointIds` optional; max 31 days) | `get-insights-charges-charger-report` | GET /insights/charges/charger-report | R |
| Driver report, driver member cost report, charge auth token report | `get-insights-charges-driver-report`, `get-insights-charges-driver-member-costs-report`, `get-insights-charges-charge-auth-token-report` | GET /insights/charges/... | R |
| Issue reports submitted by drivers about charge points | `get-reports`, `get-report`, `get-report-reasons` | GET /reports, /reports/{id}, /report/reasons | R |
| Resolve an issue report | `resolve-report` | POST /reports/{id}/resolve | M |
| Audit log | `search-audit-log`, `get-audit-log` | GET /auditlog/events | R |
| CDRs (roaming charge detail records) and exports | `get-cdrs`, CDR export tools | GET /cdrs | R |

## Wallets and money

| Task | Tool | Method and path | Safety |
|---|---|---|---|
| Wallets and balances | `get-wallets`, `get-wallet` | GET /wallets, /wallets/{walletId} | R |
| Wallet transactions (filters: `teamId`, `fromDate`, `toDate`, `referenceId`, `referenceType`, `state`, `group`) | `get-wallet-transactions`, `get-wallet-transaction` | GET /wallet-transactions | R |
| Transactions for an invoice | `get-wallet-transactions-invoice` | GET /wallet-transactions/invoices/{invoiceId} | R |
| Operator adjustment (moves money between wallets) | not exposed through the MCP server; use Monta Hub | POST /wallet-transactions/operator-adjustment-transaction | n/a |

## Pricing

| Task | Tool | Method and path | Safety |
|---|---|---|---|
| Price groups, applied teams, charge points in a group | `getPriceGroups`, `getPriceGroup`, `get-applied-teams-for-price-group`, `get-charge-points-in-price-group` | GET /price-groups... | R |
| Create / update / apply / set default price group, fees | `create-price-group`, `update-price-group`, `apply-price-group`, `set-default-price-group`, `create-price-group-fee`, `update-price-group-fee` | POST or PUT /price-groups... | M |
| Delete price group, fee, or tariff from all groups | `delete-price-group`, `delete-price-group-fee`, `delete-tariff-from-price-groups` | DELETE /price-groups... | D |
| Tariffs | `get-tariffs`-style tools under the Tariff tags | GET /tariffs | R |

## Users, vehicles, charge auth tokens

| Task | Tool | Method and path | Safety |
|---|---|---|---|
| Users, their teams and charge points | `get-users`, `get-user`, `get-user-teams`, `get-user-charge-points` | GET /users... | R |
| Create / update user | `create-user`, `patch-user`, `patch-user-contacts`, `set-user-default-team` | POST or PATCH or PUT /users... | M |
| Delete user, export user data | `delete-user`, `export-user-data` | DELETE /users/{id}, POST .../export-data | D |
| Vehicles, brands, models | `get-vehicles`, `get-vehicle`, `get-vehicle-brands`, `get-vehicle-models` | GET /vehicles... | R |
| Create / update / share vehicle | `create-vehicle`, `update-vehicle`, `add-vehicle-user` | POST or PATCH /vehicles... | M |
| Delete vehicle, unlink integrations, remove shared user | `delete-vehicle`, `unlink-vehicle-integrations`, `remove-vehicle-user` | DELETE /vehicles... | D |
| Charge auth tokens list / search / detail | `get-charge-auth-tokens`, `search-charge-auth-tokens`, `get-charge-auth-token` | GET /charge-auth-tokens | R |
| Create / edit token | `create-charge-auth-token`, `patch-charge-auth-token` | POST or PATCH /charge-auth-tokens | M |
| Block / unblock / delete token | `block-charge-auth-token`, `unblock-charge-auth-token`, `delete-charge-auth-token` | POST .../block, /unblock, DELETE | D |

## Webhooks

| Task | Tool | Method and path | Safety |
|---|---|---|---|
| Read config, list deliveries, single delivery | `get-webhook-config`, `get-webhook-entries`, `get-webhook-entries_1` | GET /webhooks/config, /entries | R |
| Explain a signature (debugging) | `get-signature-detail` | POST /webhooks/get-signature-detail | R (no side effects) |
| Create or replace config | `update-webhook-config` | PUT /webhooks/config | M |
| Delete config | `delete-webhook-config` | DELETE /webhooks/config | D |

## Other tags

Subscriptions and plans, installer jobs, payment terminals, promotion codes, sponsored charge points, revenue share, split billing, schedules, feature groups, themes, deeplinks, messages, and the beta Energy endpoints (sites, nodes, EVSEs, solar panels, monitoring; feature flag required) follow the same pattern: `get-*` is read-only, `post-*`/`patch-*`/`put-*` mutate, `delete-*` is destructive. Look the endpoint up at https://developer.monta.com/reference before using it.
