---
description: Show a Monta team's wallets, balances, and recent wallet transactions
argument-hint: "[team ID] [period, e.g. 30d or 2026-08-01..2026-08-31]"
---

Show wallet balances and transactions from the Monta API. Read-only.

Arguments: `$ARGUMENTS` (a team ID, and an optional period; default period: the last 30 days).

1. If the connection has not been verified in this session, call `get-current-consumer` first. If it fails, follow the `setup` skill instead.
2. If no team ID was given and the consumer has exactly one team in `teamIds`, use it; otherwise ask, or list teams with `get-teams`.
3. Call `get-wallets` and keep the wallets whose `ownerType` and `ownerId` match the team. Show each wallet's currency and balance in major units.
4. Convert the period to UTC ISO 8601 and call `get-wallet-transactions` with `teamId`, `fromDate`, `toDate`, `perPage: 100`. Page through if needed, up to 500 transactions; beyond that report the total and ask for a narrower period.
5. Present: balances, then totals in and out for the period by `group` and `kind`, then a table of the most recent 25 transactions: ID, created, from, to, amount and currency, kind, state, reference type and ID.
6. Flag transactions in a non-completed `state` older than 24 hours and any negative balance. Offer the reconciliation workflow from `monta-charging-operations` to match transactions against charges. Wallet adjustments are not available through the MCP server; point the user to Monta Hub for corrections.
