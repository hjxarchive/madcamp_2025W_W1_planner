import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TimerGateway } from './timer.gateway';
import { TimeLogsModule } from '../time-logs/time-logs.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TimeLogsModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'momento-jwt-secret-key',
    }),
  ],
  providers: [TimerGateway],
  exports: [TimerGateway],
})
export class TimerModule {}
