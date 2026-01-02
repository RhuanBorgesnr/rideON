import 'dotenv/config'
import { PrismaClient } from "@prisma/client"
process.env.PRISMA_CLIENT_ENGINE_TYPE = 'library'
process.env.PRISMA_ENGINE_TYPE = 'library'

export const prisma = new PrismaClient({})
  
