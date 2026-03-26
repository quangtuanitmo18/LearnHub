import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { S3Service } from './services/s3.service';

@Global()
@Module({
  imports: [JwtModule],
  providers: [PrismaService, JwtService, S3Service],
  exports: [PrismaService, JwtService, S3Service],
})
export class SharedModule {}
