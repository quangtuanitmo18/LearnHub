import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { S3Service } from 'src/shared/services/s3.service';

@Module({
  controllers: [UserController],
  providers: [UserService, UserRepository, S3Service],
  exports: [UserService, UserRepository],
})
export class UserModule {}
