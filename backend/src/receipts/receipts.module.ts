import { Module } from '@nestjs/common';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { ReceiptImageService } from './receipt-image.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [ReceiptsController],
  providers: [ReceiptsService, ReceiptImageService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
