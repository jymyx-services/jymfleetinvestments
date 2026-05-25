import { env } from '../config/env.js'

const levels = { error: 0, warn: 1, info: 2, debug: 3 }
const current = env.isDev ? 3 : 2

function log(level, message, data) {
  if (levels[level] > current) return
  const entry = {
    ts:    new Date().toISOString(),
    level,
    msg:   message,
    ...(data && { data })
  }
  const out = JSON.stringify(entry)
  level === 'error' ? console.error(out) : console.log(out)
}

export const logger = {
  error: (msg, data) => log('error', msg, data),
  warn:  (msg, data) => log('warn',  msg, data),
  info:  (msg, data) => log('info',  msg, data),
  debug: (msg, data) => log('debug', msg, data)
}