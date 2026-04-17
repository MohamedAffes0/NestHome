import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentFilterDto } from './dto/payment-filter.dto';

import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { Permission } from 'src/auth/types/permissions.types';

@Controller('payments')
@UseGuards(PermissionsGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // POST /payments : create a new payment
  @Post()
  @RequirePermissions(Permission.PAYMENT_CREATE)
  async create(@Body() dto: CreatePaymentDto) {
    return this.paymentService.createPayment(dto);
  }

  // GET /payments : find all with filters and pagination
  @Get()
  @RequirePermissions(Permission.PAYMENT_VIEW)
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query() rawQuery: Record<string, any>,
  ) {
    const filters: PaymentFilterDto = rawQuery;
    return this.paymentService.findAll(page, limit, filters);
  }

  // GET /payments/:id : retrieve a payment by ID
  @Get(':id')
  @RequirePermissions(Permission.PAYMENT_VIEW)
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  // PATCH /payments/:id : update a payment by ID
  @Patch(':id')
  @RequirePermissions(Permission.PAYMENT_UPDATE)
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentService.updatePayment(id, dto);
  }

  // DELETE /payments/:id : delete a payment by ID
  @Delete(':id')
  @RequirePermissions(Permission.PAYMENT_DELETE)
  remove(@Param('id') id: string) {
    return this.paymentService.deletePayment(id);
  }
}
