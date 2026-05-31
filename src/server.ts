import app from './app';
import { config } from '@config/app.config';
import { prisma } from '@database/prisma.client';

const startServer = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(config.port, () => {
      console.log(`
CRM API Server is running
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Environment : ${config.env}
Port        : ${config.port}
URL         : http://localhost:${config.port}
Database    : Connected
━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();