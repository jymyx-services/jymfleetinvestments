import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { db, connectDatabase } from '../config/database.js'
import { connectRedis } from '../config/redis.js'
import { logger } from './logger.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, '../../migrations')

async function runMigrations() {
    await connectDatabase()
    await connectRedis()

    // Create tracking table if it doesn't exist
    await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

    const applied = await db.query('SELECT filename FROM schema_migrations')
    const appliedSet = new Set(applied.rows.map(r => r.filename))

    const files = readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort()

    for (const file of files) {
        if (appliedSet.has(file)) {
            logger.info(`Skipped (already applied): ${file}`)
            continue
        }

        const sql = readFileSync(join(migrationsDir, file), 'utf8')
        await db.query(sql)
        await db.query(
            'INSERT INTO schema_migrations (filename) VALUES ($1)', [file]
        )
        logger.info(`Applied: ${file}`)
    }

    logger.info('All migrations complete')
    process.exit(0)
}

runMigrations().catch(err => {
    logger.error('Migration failed', { err: err.message })
    process.exit(1)
})