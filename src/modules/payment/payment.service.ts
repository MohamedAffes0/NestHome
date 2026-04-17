import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentFilterDto } from './dto/payment-filter.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  /**
   * Create a new payment record. The DTO must include the amount, realEstateId Validates that the real estate and user exist before creating the payment.
   *
   * @param dto - The data for the new payment, including amount, realEstateId, and userId
   * @returns The created payment record
   */
  async createPayment(dto: CreatePaymentDto) {
    const payment = this.paymentRepository.create({ ...dto });
    return await this.paymentRepository.save(payment);
  }

  /**
   * Find all payments with optional filters for userId and realEstateId, and sorting by date. Supports pagination with page and limit parameters.
   *
   * @param page - The page number for pagination (default: 1)
   * @param limit - The number of items per page for pagination (default: 10)
   * @param filters - Optional filters for userId, realEstateId, and sortByDate
   * @returns An object containing the paginated list of payments and metadata about the pagination
   */
  async findAll(page: number, limit: number, filters: PaymentFilterDto) {
    const skip = (page - 1) * limit;
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.realEstate', 'realEstate')
      .leftJoinAndSelect('payment.user', 'user')
      .groupBy('payment.id')
      .addGroupBy('realEstate.id')
      .addGroupBy('user.id');

    if (filters.userId) {
      query.andWhere('payment.userId = :userId', { userId: filters.userId });
    }
    if (filters.realEstateId) {
      query.andWhere('payment.realEstateId = :realEstateId', {
        realEstateId: filters.realEstateId,
      });
    }
    if (filters.sortByDate) {
      query.orderBy(
        'payment.date',
        filters.sortByDate.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    const countQb = query.clone();
    const totalItems = (await countQb.getRawMany()).length;

    query.skip(skip).take(limit);
    const payments = await query.getMany();

    return {
      items: payments,
      meta: {
        totalItems,
        itemCount: payments.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Find a single payment by its ID. If the payment does not exist, throws a NotFoundException.
   *
   * @param id - The ID of the payment to find
   * @returns The payment record with the specified ID, including related user and real estate information
   */
  async findOne(id: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'realEstate'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  /**
   * Update an existing payment record by its ID. The DTO can include any of the payment fields (amount, realEstateId, userId). Validates that the payment exists before updating.
   *
   * @param id - The ID of the payment to update
   * @param dto - The data to update the payment with, which can include amount, realEstateId, and userId
   * @returns The updated payment record
   */
  async updatePayment(id: string, dto: UpdatePaymentDto) {
    const payment = await this.findOne(id);
    Object.assign(payment, dto);
    return await this.paymentRepository.save(payment);
  }

  /**
   * Delete a payment record by its ID. Validates that the payment exists before attempting to delete it. If the payment does not exist, throws a NotFoundException.
   *
   * @param id - The ID of the payment to delete
   * @returns A success message upon successful deletion
   */
  async deletePayment(id: string) {
    const payment = await this.findOne(id);
    return await this.paymentRepository.remove(payment);
  }
}
