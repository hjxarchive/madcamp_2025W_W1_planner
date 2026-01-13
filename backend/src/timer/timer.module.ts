import { Module } from '@nestjs/common';
import { TimerGateway } from './timer.gateway';
import { TimeLogsModule } from '../time-logs/time-logs.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TimeLogsModule, UsersModule],
  providers: [TimerGateway],
  exports: [TimerGateway],
})
export class TimerModule {}
