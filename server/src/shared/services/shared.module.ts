import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { HashingService } from './hash.service';

const sharedServices = [PrismaService, TokenService, HashingService];

@Global()
@Module({
  providers: sharedServices,
  exports: sharedServices,
  imports: [JwtModule],
})
export class SharedModule {}
