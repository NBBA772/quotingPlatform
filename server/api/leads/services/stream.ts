import { defineEventHandler, getCookie } from 'h3'
import { getUserByAuthToken } from '~/server/database/repositories/sessionRepository'
import { createRedisSubscriber } from '~/server/utils/redisClient'

export default defineEventHandler(async (event) => {

  // 1️⃣ Get auth token from cookie
  const authToken = getCookie(event, 'auth_token')
  if (!authToken) {
    event.res.writeHead(401, { 'Content-Type': 'text/plain' })
    return event.res.end('Unauthorized')
  }

  // 2️⃣ Get userId from token
  const user = await getUserByAuthToken(authToken)
  if (!user?.id) {
    event.res.writeHead(401, { 'Content-Type': 'text/plain' })
    return event.res.end('Unauthorized')
  }


  // 3️⃣ Setup SSE headers
  event.res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })
  event.res.flushHeaders()

  // 4️⃣ Connect to Redis and subscribe. If Redis is down, keep the SSE
  // connection open without live updates instead of crashing the request.
  const redisSub = createRedisSubscriber()
  try {
    await redisSub.subscribe(`leads_channel:${user.id}`)
  } catch (err: any) {
    console.error('[SSE] Redis unavailable, no live updates:', err.message)
  }

  redisSub.on('message', (_, message) => {
    const payload = typeof message === 'string' ? message : JSON.stringify(message)
    event.res.write(`data: ${payload}\n\n`)
  })

  // 5️⃣ Cleanup on disconnect
  event.req.on('close', () => {
    redisSub.unsubscribe()
    redisSub.quit()
  })
})
