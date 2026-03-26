import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { PaymentController } from './payment.controller';
import { OrderModule } from '../order/order.module';
import { EmailModule } from '../email/email.module';
import { StripeService } from './services/stripe.service';

@Module({
  imports: [OrderModule, EmailModule],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, StripeService],
  exports: [PaymentService, PaymentRepository, StripeService],
})
export class PaymentModule {}
