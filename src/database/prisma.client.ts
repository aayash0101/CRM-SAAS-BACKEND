import { PrismaClient } from '@prisma/client';
import { config } from '@config/app.config';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isDevelopment
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
  });

if (config.isDevelopment) {
  globalForPrisma.prisma = prisma;
}