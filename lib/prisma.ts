import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(); // 인자를 비워두면 prisma.config.ts 설정을 따릅니다.

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;