import { Module } from '@nestjs/common';
import { ChecklistsController } from './checklists.controller';
import { ChecklistsService } from './checklists.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [ChecklistsController],
  providers: [ChecklistsService],
  exports: [ChecklistsService],
})
export class ChecklistsModule {}
