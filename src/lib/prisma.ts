// @ts-nocheck
import { PrismaClient } from '../generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma 7 requires an adapter, but for development we'll use a simple instance
// In production, configure with: new PrismaClient({ adapter: new PrismaPg({...}) })
export const prisma = globalForPrisma.prisma ?? new PrismaClient({} as any)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
