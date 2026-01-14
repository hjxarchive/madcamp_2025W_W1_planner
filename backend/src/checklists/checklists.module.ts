import { Module, forwardRef } from '@nestjs/common';
import { ChecklistsController } from './checklists.controller';
import { ChecklistsService } from './checklists.service';
import { UsersModule } from '../users/users.module';
import { TimerModule } from '../timer/timer.module';

@Module({
  imports: [UsersModule, forwardRef(() => TimerModule)],
  controllers: [ChecklistsController],
  providers: [ChecklistsService],
  exports: [ChecklistsService],
})
export class ChecklistsModule {}
