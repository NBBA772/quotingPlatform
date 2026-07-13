import Redis from 'ioredis'

// One shared Redis connection for the whole server, configured to fail fast
// when Redis is down instead of leaking sockets. The previous setup created a
// client per file (and per SSE connection) with infinite default retries —
// with Redis stopped, the retry storm exhausted file descriptors (EMFILE)
// and took the dev server down.
const redisOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT || 6379),
  lazyConnect: true,          // don't open a socket until Redis is actually used
  enableOfflineQueue: false,  // fail commands immediately instead of queueing forever
  maxRetriesPerRequest: 1,
  // keep retrying in case Redis comes up later, but slowly (one socket per 10s)
  retryStrategy: () => 10_000,
}

let sharedClient: Redis | null = null

export function getRedis(): Redis {
  if (!sharedClient) {
    sharedClient = new Redis(redisOptions)
    sharedClient.on('error', (err: Error) => {
      console.error('[redis] connection error:', err.message)
    })
  }
  return sharedClient
}

// Publishes without throwing — lead assignment etc. should still succeed when
// Redis (used only for live UI notifications) is unavailable.
export async function safePublish(channel: string, message: string): Promise<void> {
  try {
    await getRedis().publish(channel, message)
  } catch (err: any) {
    console.error(`[redis] publish to ${channel} failed:`, err.message)
  }
}

// Pub/sub subscribers need a dedicated connection; callers must quit() it on close.
export function createRedisSubscriber(): Redis {
  const sub = new Redis(redisOptions)
  sub.on('error', (err: Error) => {
    console.error('[redis] subscriber error:', err.message)
  })
  return sub
}
