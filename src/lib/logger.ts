type LogLevel = "debug" | "info" | "warn" | "error"

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, unknown>
  error?: Error
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel = LOG_LEVELS[(process.env.LOG_LEVEL as LogLevel) || "info"]

function formatEntry(entry: LogEntry): string {
  const base = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`
  if (entry.context) {
    return `${base} ${JSON.stringify(entry.context)}`
  }
  return base
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
  if (LOG_LEVELS[level] < currentLevel) return

  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context,
    error,
  }

  const formatted = formatEntry(entry)

  switch (level) {
    case "error":
      console.error(formatted)
      break
    case "warn":
      console.warn(formatted)
      break
    default:
      console.log(formatted)
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
  error: (message: string, context?: Record<string, unknown>, error?: Error) =>
    log("error", message, context, error),
}

export function logRequest(method: string, path: string, status: number, duration: number) {
  const level = status >= 500 ? "error" : status >= 400 ? "warn" : "info"
  log(level, `${method} ${path} ${status}`, { duration: `${duration}ms` })
}

export function logError(error: Error, context?: Record<string, unknown>) {
  log("error", error.message, context, error)
}
