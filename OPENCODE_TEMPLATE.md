# OpenCode Project Template
# Copy this file to new projects as opencode.json

# ============================================
# TEMPLATE: Next.js + Supabase + Vercel Stack
# ============================================

{
  "$schema": "https://opencode.ai/config.json",
  
  "provider": {
    "openai": {
      "npm": "@ai-sdk/openai",
      "options": { "apiKey": "{env:OPENAI_API_KEY}" },
      "models": {
        "gpt-4o": { "name": "GPT-4o", "attachment": true, "reasoning": false, "temperature": 0.7 },
        "gpt-4o-mini": { "name": "GPT-4o Mini", "attachment": false, "reasoning": false, "temperature": 0.7 }
      }
    }
  },

  "model": {
    "big": "openai/gpt-4o",
    "small": "openai/gpt-4o-mini"
  },

  "mcp": {
    "supabase": {
      "type": "remote",
      "url": "https://mcp.supabase.com/mcp"
    },
    "github": {
      "type": "remote",
      "url": "https://api.github.com/mcp"
    },
    "context7": {
      "type": "local",
      "command": ["npx", "-y", "@upstash/context7-mcp@latest"]
    },
    "playwright": {
      "type": "local",
      "command": ["npx", "-y", "@anthropic-ai/mcp-playwright"]
    }
  },

  "tools": {
    "filesystem": true,
    "bash": true,
    "memory": true
  }
}

# ============================================
# TEMPLATE: React/Vite + Firebase Stack
# ============================================

# {
#   "$schema": "https://opencode.ai/config.json",
#   "provider": {
#     "openai": {
#       "npm": "@ai-sdk/openai",
#       "options": { "apiKey": "{env:OPENAI_API_KEY}" },
#       "models": {
#         "gpt-4o": { "name": "GPT-4o", "attachment": true },
#         "gpt-4o-mini": { "name": "GPT-4o Mini", "attachment": false }
#       }
#     }
#   },
#   "model": { "big": "openai/gpt-4o", "small": "openai/gpt-4o-mini" },
#   "mcp": {
#     "firebase": {
#       "type": "local",
#       "command": ["npx", "-y", "firebase-mcp"]
#     },
#     "github": { "type": "remote", "url": "https://api.github.com/mcp" },
#     "context7": { "type": "local", "command": ["npx", "-y", "@upstash/context7-mcp@latest"] }
#   }
# }

# ============================================
# TEMPLATE: Python/Django + PostgreSQL Stack
# ============================================

# {
#   "$schema": "https://opencode.ai/config.json",
#   "provider": {
#     "openai": {
#       "npm": "@ai-sdk/openai",
#       "options": { "apiKey": "{env:OPENAI_API_KEY}" },
#       "models": {
#         "gpt-4o": { "name": "GPT-4o", "attachment": true },
#         "gpt-4o-mini": { "name": "GPT-4o Mini", "attachment": false }
#       }
#     }
#   },
#   "model": { "big": "openai/gpt-4o", "small": "openai/gpt-4o-mini" },
#   "mcp": {
#     "postgres": {
#       "type": "local",
#       "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"]
#     },
#     "github": { "type": "remote", "url": "https://api.github.com/mcp" },
#     "context7": { "type": "local", "command": ["npx", "-y", "@upstash/context7-mcp@latest"] }
#   }
# }

# ============================================
# MCP SERVERS REFERENCE
# ============================================
#
# LOCAL MCP SERVERS (run via npx or installed):
#   @upstash/context7-mcp     - Library documentation
#   @anthropic-ai/mcp-playwright - Browser testing
#   @modelcontextprotocol/server-postgres - PostgreSQL
#   @modelcontextprotocol/server-filesystem - File system
#   @sentry/mcp-server        - Error tracking
#   @resend/mcp               - Email management
#   firebase-mcp              - Firebase integration
#
# REMOTE MCP SERVERS (no install needed):
#   https://mcp.supabase.com/mcp   - Supabase
#   https://api.github.com/mcp     - GitHub
#   https://mcp.vercel.com/mcp     - Vercel
#   https://mcp.figma.com/mcp      - Figma
#
# CONFIG SYNTAX:
#   {env:VARIABLE_NAME}  - Reference env variable
#   type: "local"        - Runs locally via command
#   type: "remote"       - Connects to hosted server
#   type: "remote+oauth" - Remote with OAuth auth flow
