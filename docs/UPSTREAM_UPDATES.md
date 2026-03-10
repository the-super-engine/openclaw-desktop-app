# Upstream Updates Research

## OpenClaw 2026.3.8 ✅ Applied

- **Status**: Upgraded from 2026.3.1 to 2026.3.8
- **Breaking changes** (3.1→3.8):
  - `tools.profile` default changed from `"messaging"` to `"coding"` in 3.7 — agents may need `tools.profile: "coding"` in config for exec/filesystem tools
  - `acp.dispatch.enabled` defaults to `true` since 3.2
- **New in 3.8**: Backup CLI (`openclaw backup create/verify`), macOS LaunchAgent fixes, Telegram dupes fix, 12+ security patches
- **Our impact**: No code changes required; gateway RPC remains compatible

---

## ClawX Recent Updates (v0.1.24-alpha.9)

### Multi-Agent Support (#385)

ClawX added a full **Agents** page for managing multiple AI agents and channel assignments.

**Architecture difference**: ClawX uses an HTTP API server (`electron/api/`) with routes like `/api/agents`, `/api/channels`, etc. Our project uses **IPC + Gateway RPC** directly — no HTTP API layer.

**To merge multi-agent** would require:
1. Adding `electron/api/` server and route handlers
2. `electron/api/routes/agents.ts` — agent CRUD + channel assignment
3. `src/stores/agents.ts` — agents store (uses `hostApiFetch`, not IPC)
4. `src/pages/Agents/index.tsx` — Agents UI (~570 lines)
5. `src/types/agent.ts` — AgentSummary, AgentsSnapshot types
6. Gateway integration for agent config sync

**Effort**: Medium–high (architecture divergence)

### Other ClawX Dependencies We Don't Have

- `@wecom/wecom-openclaw-plugin` — WeCom channel
- `@sliverp/qqbot` — QQ bot channel
- `electron/api/` — HTTP API server (we use IPC)
- `electron/services/providers/` — Provider service layer
- `src/pages/Models/` — Models page

### Recommendation

- **OpenClaw 3.8**: ✅ Done
- **Multi-agent**: Defer — would need architectural alignment (HTTP API vs IPC) or a separate implementation path using our existing gateway RPC
