import { Module } from '@nestjs/common';
import { TimeLogsController } from './time-logs.controller';
import { TimeLogsService } from './time-logs.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [TimeLogsController],
  providers: [TimeLogsService],
  exports: [TimeLogsService],
})
export class TimeLogsModule {}
