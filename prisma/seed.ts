import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const walkers = [
    { name: 'Sarah Johnson', email: 'sarah@example.com', bio: 'Professional dog trainer with 5 years of experience. I love all breeds!', hourlyRate: 25, city: 'San Francisco', availability: 'Weekdays 7am-7pm, Weekends 9am-5pm' },
    { name: 'Mike Chen', email: 'mike@example.com', bio: 'Lifelong dog lover and former vet assistant. Your dog is in safe hands.', hourlyRate: 20, city: 'San Francisco', availability: 'Mon-Sat 8am-6pm' },
    { name: 'Emma Davis', email: 'emma@example.com', bio: 'Energetic walker who loves long walks in the park. Great with small dogs!', hourlyRate: 18, city: 'Oakland', availability: 'Flexible hours, please inquire' },
  ]

  const owners = [
    { name: 'Tom Wilson', email: 'tom@example.com', dogs: [{ name: 'Buddy', breed: 'Golden Retriever', size: 'LARGE', notes: 'Very friendly, loves other dogs' }] },
    { name: 'Lisa Park', email: 'lisa@example.com', dogs: [{ name: 'Mochi', breed: 'Shih Tzu', size: 'SMALL', notes: 'A bit shy at first but warms up quickly' }] },
    { name: 'James Brown', email: 'james@example.com', dogs: [{ name: 'Zeus', breed: 'German Shepherd', size: 'LARGE', notes: 'Needs an experienced walker. No small dogs please.' }] },
  ]

  const pw = await bcrypt.hash('password123', 10)

  for (const w of walkers) {
    const user = await prisma.user.upsert({
      where: { email: w.email },
      update: {},
      create: { name: w.name, email: w.email, password: pw, role: 'WALKER' },
    })
    await prisma.walkerProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, bio: w.bio, hourlyRate: w.hourlyRate, city: w.city, availability: w.availability, rating: 4.5 + Math.random() * 0.5, reviewCount: Math.floor(Math.random() * 30) + 5 },
    })
  }

  for (const o of owners) {
    const user = await prisma.user.upsert({
      where: { email: o.email },
      update: {},
      create: { name: o.name, email: o.email, password: pw, role: 'OWNER' },
    })
    for (const d of o.dogs) {
      const exists = await prisma.dog.findFirst({ where: { ownerId: user.id, name: d.name } })
      if (!exists) await prisma.dog.create({ data: { ownerId: user.id, ...d } })
    }
  }

  console.log('✅ Seed complete!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
