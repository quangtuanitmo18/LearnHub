import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { BlogRepository } from './blog.repository';
import { UserModule } from '../user/user.module';
import { CategoryModule } from '../category/category.module';
import { GamificationModule } from '../gamification/gamification.module';
import { AiWorkerModule } from '../ai-worker/ai-worker.module';

@Module({
  imports: [UserModule, CategoryModule, GamificationModule, AiWorkerModule],
  controllers: [BlogController],
  providers: [BlogService, BlogRepository],
  exports: [BlogService, BlogRepository],
})
export class BlogModule {}
