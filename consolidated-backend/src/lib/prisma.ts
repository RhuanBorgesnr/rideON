process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library'
process.env.PRISMA_ENGINE_TYPE = 'library'
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
