import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { TimeLogsModule } from './time-logs/time-logs.module';
import { LocationsModule } from './locations/locations.module';
import { StudySessionsModule } from './study-sessions/study-sessions.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { TimerModule } from './timer/timer.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    ChecklistsModule,
    TimeLogsModule,
    LocationsModule,
    StudySessionsModule,
    ReceiptsModule,
    TimerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
