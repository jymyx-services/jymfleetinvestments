import Redis   from 'ioredis'
import { env } from './env.js'

export const redis = new Redis(env.redisUrl, {
  retryStrategy: (times) => Math.min(times * 50, 2000),
  lazyConnect:   false
})

redis.on('error',        err  => console.error('Redis error:', err))
redis.on('reconnecting', ()   => console.log('Redis reconnecting...'))

export async function connectRedis() {
  await redis.ping()
  console.log('Redis connected')
}

export function createSubscriber() {
  return new Redis(env.redisUrl, {
    retryStrategy: (times) => Math.min(times * 50, 2000)
  })
}