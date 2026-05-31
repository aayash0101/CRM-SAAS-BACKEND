import { PrismaClient } from '@prisma/client';
import { config } from '@config/app.config';

// Prevent multiple PrismaClient instances in development (hot reload creates new instances)
declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__prisma ??
  new PrismaClient({
    log: config.isDevelopment
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
  });

if (config.isDevelopment) {
  global.__prisma = prisma;
}