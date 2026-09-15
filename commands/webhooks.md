---
description: Show the Monta webhook configuration and recent deliveries, including failures
argument-hint: "[pending|completed|failed]"
---

Show the webhook setup for the connected credential. Read-only.

Arguments: `$ARGUMENTS` (optional delivery status filter: `pending`, `completed`, or `failed`; default shows failed and pending).

1. If the connection has not been verified in this session, call `get-current-consumer` first. If it fails, follow the `setup` skill instead.
2. Call `get-webhook-config`. If it returns 404 or an empty config, say no webhook is configured and describe what `update-webhook-config` needs: `webhookUrl` (https), `webhookSecret` (16 to 191 characters), `eventTypes`, optional `teamIds` (max 100) and `customHeaders` (max 5, `X-` prefix). Quote the event type names exactly as the API defines them: `charges`, `charge-points`, `charge-points-protocol-updates`, `sites`, `users`, `team-members`, `teams`, `installer-jobs`, `wallet-transactions`, `price-groups`, `subscriptions`, `plans`, `charge-auth-tokens`, `reports`, and `ocpp-messages` (pilot). Each delivery carries `eventType` of `created`, `updated`, or `deleted`. Do not invent other names and do not create a config from this command.
3. Present the config: URL, event types, team restriction, custom header names (never values), and never print the secret.
4. Call `get-webhook-entries` with `status` set to the requested filter (or `failed`, then `pending`) and `perPage: 100`. Summarise counts per status and per `entityType`.
5. Show the most recent 20 entries: ID, entity type, entity ID, event type, event time, status. For failed entries, group by entity type and time window so a receiver outage stands out.
6. If the user is debugging signatures, explain that deliveries carry `X-Monta-Signature: sha1=<HMAC-SHA1 of the body with the webhook secret>` and that `get-signature-detail` can show the expected value for a sample body. Do not change the config from this command.
