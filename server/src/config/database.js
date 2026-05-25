import pg from 'pg'
import { env } from './env.js'

const { Pool } = pg

export const db = new Pool({
  connectionString: env.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

db.on('error', (err) => {
  console.error('PostgreSQL pool error:', err)
})

export async function connectDatabase() {
  console.log('Connecting to DB')
  const client = await db.connect()
  client.release()
  console.log('PostgreSQL connected')
}

/**
 * Run queries with automatic error context.
 * Usage: await query('SELECT * FROM users WHERE id = $1', [id])
 */
export async function query(text, params) {
  const start = Date.now()
  const res = await db.query(text, params)
  if (env.isDev) {
    console.log(`[DB] ${Date.now() - start}ms — ${text.slice(0, 60)}`)
  }
  return res
}

/**
 * Transaction helper.
 * Usage: await transaction(async (trx) => { await trx.query(...) })
 */
export async function transaction(callback) {
  const client = await db.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}