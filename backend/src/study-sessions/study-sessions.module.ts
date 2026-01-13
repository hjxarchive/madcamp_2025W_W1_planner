import { Module } from '@nestjs/common';
import { StudySessionsController } from './study-sessions.controller';
import { StudySessionsService } from './study-sessions.service';
import { StudyGateway } from './study.gateway';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [StudySessionsController],
  providers: [StudySessionsService, StudyGateway],
  exports: [StudySessionsService],
})
export class StudySessionsModule {}
