# Claude Code Configuration
# This file is for Claude Code CLI (separate from OpenCode)

@AGENTS.md

## Additional Instructions for Claude Code

### When Working on QueueForge
1. Always check `AGENTS.md` first for project context
2. Use TypeScript for all new code
3. Follow existing code patterns
4. Run `npm run build` before committing
5. Test with Playwright when possible

### MCP Servers
- Supabase: `mcp.supabase.com`
- GitHub: `api.github.com/mcp`
- Context7: `@upstash/context7-mcp`
- Playwright: `@anthropic-ai/mcp-playwright`

### Quick Commands
```bash
# Development
npm run dev

# Build
npm run build

# Database
npx prisma migrate dev
npx prisma generate

# Testing
npx playwright test
```
