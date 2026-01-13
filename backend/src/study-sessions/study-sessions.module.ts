import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { StudySessionsController } from './study-sessions.controller';
import { StudySessionsService } from './study-sessions.service';
import { StudyGateway } from './study.gateway';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'momento-jwt-secret-key',
    }),
  ],
  controllers: [StudySessionsController],
  providers: [StudySessionsService, StudyGateway],
  exports: [StudySessionsService],
})
export class StudySessionsModule {}
