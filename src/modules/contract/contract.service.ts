import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Contract } from './contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractFilterDto } from './dto/contract-filter.dto';
import {
  RealEstate,
  RealEstateStatus,
} from '../real-estate/real-estate.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,

    @InjectRepository(RealEstate)
    private realEstateRepository: Repository<RealEstate>,
  ) {}

  /**
   * Create a new contract with validation
   * Validates that the start date is before the end date, the real estate exists and is available, and that the user exists. Then creates and saves the contract to the database.
   *
   * @param dto - The data transfer object containing contract details
   * @param agentId - The ID of the agent creating the contract
   * @returns The created contract
   * @throws BadRequestException if validation fails (e.g. start date is after end date, real estate is not available)
   * @throws NotFoundException if the real estate or user is not found
   */
  async createContract(dto: CreateContractDto, agentId: string) {
    if (dto.endDate && new Date(dto.startDate) > new Date(dto.endDate)) {
      throw new BadRequestException('startDate must be before endDate');
    }

    const realEstate = await this.realEstateRepository.findOne({
      where: { id: dto.realEstateId },
    });

    if (!realEstate) {
      throw new NotFoundException('Real estate not found');
    }

    const user = await this.contractRepository.manager.findOne('User', {
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      realEstate.status === RealEstateStatus.RENTED ||
      realEstate.status === RealEstateStatus.SOLD
    ) {
      throw new BadRequestException('Real estate is not available');
    }

    if (realEstate.status === RealEstateStatus.FOR_RENT && !dto.endDate) {
      throw new BadRequestException('endDate is required for rental contracts');
    }

    const contractData: Partial<Contract> = {
      cinPassport: dto.cinPassport,
      startDate: new Date(dto.startDate),
      userId: dto.userId,
      agentId,
      realEstateId: dto.realEstateId,
    };

    if (realEstate.status === RealEstateStatus.FOR_RENT && dto.endDate) {
      contractData.endDate = new Date(dto.endDate);
    }

    const contract = this.contractRepository.create(contractData);

    // Update real estate status to SOLD or RENTED based on the contract type
    realEstate.status =
      realEstate.status === RealEstateStatus.FOR_SALE
        ? RealEstateStatus.SOLD
        : RealEstateStatus.RENTED;

    await this.realEstateRepository.save(realEstate);

    return await this.contractRepository.save(contract);
  }

  /**
   * Find all contracts with pagination and optional filtering by userId, realEstateId, agentId, startDate, and endDate. Returns a paginated list of contracts matching the filters.
   *
   * @param page - The page number for pagination (default: 1)
   * @param limit - The number of items per page for pagination (default: 10)
   * @param filters - Optional filters for userId, realEstateId, agentId, startDate, and endDate
   * @returns A paginated list of contracts matching the filters
   */
  async findAll(page: number, limit: number, filters: ContractFilterDto) {
    const skip = (page - 1) * limit;

    const query = this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.user', 'user')
      .leftJoinAndSelect('contract.agent', 'agent')
      .leftJoinAndSelect('contract.realEstate', 'realEstate');

    if (filters.userId) {
      query.andWhere('contract.userId = :userId', { userId: filters.userId });
    }
    if (filters.realEstateId) {
      query.andWhere('contract.realEstateId = :realEstateId', {
        realEstateId: filters.realEstateId,
      });
    }
    if (filters.agentId) {
      query.andWhere('contract.agentId = :agentId', {
        agentId: filters.agentId,
      });
    }
    if (filters.startDate) {
      query.andWhere('contract.startDate >= :startDate', {
        startDate: filters.startDate,
      });
    }
    if (filters.endDate) {
      query.andWhere('contract.endDate <= :endDate', {
        endDate: filters.endDate,
      });
    }

    query.skip(skip).take(limit);
    const [items, total] = await query.getManyAndCount();

    return {
      items,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Find a single contract by ID, including related user, agent, and real estate information. Throws NotFoundException if the contract does not exist.
   *
   * @param id - The ID of the contract to find
   * @returns The contract with related user, agent, and real estate information
   * @throws NotFoundException if the contract is not found
   */
  async findOne(id: string) {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['user', 'agent', 'realEstate'],
    });

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  /**
   * Update an existing contract with new data.
   *
   * @param id - The ID of the contract to update
   * @param dto - The data transfer object containing updated contract details
   * @returns The updated contract
   * @throws BadRequestException if validation fails (e.g. end date cannot be added to sold contract, end date cannot be in the past, start date is after end date)
   * @throws NotFoundException if the contract is not found
   */
  async updateContract(id: string, dto: UpdateContractDto) {
    const contract = await this.findOne(id);

    if (!contract.endDate && dto.endDate) {
      throw new BadRequestException(
        'endDate cannot be added to an existing sold contract',
      );
    }
    if (contract.endDate && dto.endDate) {
      if (new Date(dto.endDate) < new Date()) {
        throw new BadRequestException('endDate cannot be in the past');
      }
    }
    if (contract.endDate && !dto.endDate) {
      throw new BadRequestException(
        'endDate cannot be removed from a rented contract',
      );
    }

    const finalStartDate = dto.startDate
      ? new Date(dto.startDate)
      : contract.startDate;
    const finalEndDate = dto.endDate ? new Date(dto.endDate) : contract.endDate;

    if (finalStartDate && finalEndDate && finalStartDate > finalEndDate) {
      throw new BadRequestException('startDate must be before endDate');
    }

    Object.assign(contract, dto);
    return await this.contractRepository.save(contract);
  }

  /**
   * Delete a contract by ID. Validates that the contract exists before deleting it from the database.
   *
   * @param id - The ID of the contract to delete
   * @returns A success message upon successful deletion
   * @throws NotFoundException if the contract is not found
   */
  async deleteContract(id: string) {
    const contract = await this.findOne(id);
    await this.contractRepository.remove(contract);
    return { message: 'Contract deleted successfully' };
  }

  /**
   * Return a list of contracts that are either unpaid sales contracts (where total payments are less than the real estate price) or rental contracts that have not received payment for the current month. This method checks for expired contracts based on the current date and returns them in a structured format.
   *
   * @returns An object containing lists of unpaid expired sale and rental contracts, along with the total count of such contracts.
   */
  async findUnpaidExpiredContracts() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    // ── 1. Sales contracts not fully paid ────────────────────────
    const saleContracts = await this.contractRepository
      .createQueryBuilder('contract')
      .innerJoinAndSelect('contract.realEstate', 'realEstate')
      .innerJoinAndSelect('contract.user', 'user')
      .leftJoin(
        (qb) =>
          qb
            .select('p."userId"', 'pUserId')
            .addSelect('p."realEstateId"', 'pRealEstateId')
            .addSelect('SUM(p.amount)', 'totalPaid')
            .from('payments', 'p')
            .groupBy('p."userId"')
            .addGroupBy('p."realEstateId"'),
        'paySum',
        '"paySum"."pUserId" = contract."userId" AND "paySum"."pRealEstateId" = contract."realEstateId"',
      )
      .where('contract."endDate" IS NULL')
      .andWhere('realEstate.status = :sold', { sold: RealEstateStatus.SOLD })
      .andWhere(
        'COALESCE(CAST("paySum"."totalPaid" AS NUMERIC), 0) < realEstate.price',
      )
      .getMany();

    // ── 2. Rental contracts not paid for the current month ───────────
    const rentalContracts = await this.contractRepository
      .createQueryBuilder('contract')
      .innerJoinAndSelect('contract.realEstate', 'realEstate')
      .innerJoinAndSelect('contract.user', 'user')
      .leftJoin(
        (qb) =>
          qb
            .select('p."userId"', 'pUserId')
            .addSelect('p."realEstateId"', 'pRealEstateId')
            .addSelect('SUM(p.amount)', 'paidThisMonth')
            .from('payments', 'p')
            .where('p.date >= :firstDay', { firstDay: firstDayOfMonth })
            .andWhere('p.date <= :lastDay', { lastDay: lastDayOfMonth })
            .groupBy('p."userId"')
            .addGroupBy('p."realEstateId"'),
        'monthPay',
        '"monthPay"."pUserId" = contract."userId" AND "monthPay"."pRealEstateId" = contract."realEstateId"',
      )
      .where('contract."endDate" IS NOT NULL')
      .andWhere('realEstate.status = :rented', {
        rented: RealEstateStatus.RENTED,
      })
      .andWhere('contract."startDate" <= :today', { today })
      .andWhere('contract."endDate"   >= :firstDay', {
        firstDay: firstDayOfMonth,
      })
      .andWhere(
        'COALESCE(CAST("monthPay"."paidThisMonth" AS NUMERIC), 0) < realEstate.price',
      )
      .getMany();

    return {
      sale: saleContracts,
      rental: rentalContracts,
      total: saleContracts.length + rentalContracts.length,
    };
  }
}
