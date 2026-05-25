import bcrypt from 'bcrypt'
import { connectDatabase, query } from '../src/config/database.js'
import { connectRedis } from '../src/config/redis.js'
import { logger } from '../src/lib/logger.js'
import { env } from '../src/config/env.js'

async function seed() {
    await connectDatabase()
    await connectRedis()

    // Check if superadmin already exists
    const existing = await query(
        `SELECT id FROM users WHERE email = $1`,
        [env.superadminEmail || 'admin@jfi.com']
    )

    if (existing.rows.length > 0) {
        logger.info('Superadmin already exists — skipping seed')
        process.exit(0)
    }

    const passwordHash = await bcrypt.hash(
        env.superadminPassword || '',
        12
    )

    await query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, investor_code)
     VALUES ($1, $2, $3, $4, 'superadmin', 'JFI-ADMIN')`,
        ['JFI Super Admin', env.superadminEmail || 'admin@jfi.com', '+000000000000', passwordHash]
    )

    logger.info('Superadmin created successfully')
    logger.info(`Email:    ${env.superadminEmail || 'admin@jfi.com'}`)
    logger.info('Password: (set in your .env SUPERADMIN_PASSWORD)')
    process.exit(0)
}

seed().catch(err => {
    logger.error('Seed failed', { err: err.message })
    process.exit(1)
})