import { Injectable } from '@nestjs/common';

import { PrismaPg } from '@prisma/adapter-pg';

import dotenv from 'dotenv';
import { PrismaClient } from 'src/generated/prisma/client';

dotenv.config();

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    console.log('Database URL:', process.env.DATABASE_URL);
    super({ adapter });
  }
}
