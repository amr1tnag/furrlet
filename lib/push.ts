import webpush from 'web-push'
import { prisma } from './prisma'

export async function sendPushToUser(userId: string, payload: { title: string; body: string; url?: string }) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return

  webpush.setVapidDetails(
    'mailto:furrlet.in@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )

  const subs = await prisma.pushSubscription.findMany({ where: { userId } })
  const dead: string[] = []

  await Promise.allSettled(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        )
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) dead.push(sub.id)
      }
    })
  )

  if (dead.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: dead } } })
  }
}
