import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from '@config/app.config';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: config.db.url });

  return new PrismaClient({
    adapter,
    log: config.isDevelopment
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
  });
}

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (config.isDevelopment) {
  globalForPrisma.prisma = prisma;
}