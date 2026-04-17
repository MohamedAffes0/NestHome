import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation, ReservationStatus } from './reservation.entity';
import { RealEstate } from '../real-estate/real-estate.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReservationFilterDto } from './dto/reservation-filter.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(RealEstate)
    private readonly realEstateRepository: Repository<RealEstate>,
  ) {}

  /**
   * Apply filters to the reservation query builder based on the provided filter criteria. This method modifies the query builder in place, adding conditions for client phone, reservation status, associated real estate ID, user ID of the real estate owner, and visit date range.
   *
   * @param qb - The SelectQueryBuilder instance for reservations to which filters will be applied
   * @param filters - An object containing the filter criteria, including clientPhone, status, realEstateId, userId, minVisitDate, and maxVisitDate
   */
  private applyFilters(
    qb: SelectQueryBuilder<Reservation>,
    filters: ReservationFilterDto,
  ): void {
    if (filters.clientPhone) {
      qb.andWhere('LOWER(reservation.clientPhone) LIKE :clientPhone', {
        clientPhone: `%${filters.clientPhone.toLowerCase()}%`,
      });
    }

    if (filters.status) {
      qb.andWhere('reservation.status = :status', {
        status: filters.status,
      });
    }

    if (filters.realEstateId) {
      qb.andWhere('reservation.realEstateId = :realEstateId', {
        realEstateId: filters.realEstateId,
      });
    }

    if (filters.userId) {
      qb.andWhere('realEstate.userId = :userId', {
        userId: filters.userId,
      });
    }

    if (filters.minVisitDate) {
      qb.andWhere('reservation.visitDate >= :minVisitDate', {
        minVisitDate: filters.minVisitDate,
      });
    }

    if (filters.maxVisitDate) {
      qb.andWhere('reservation.visitDate <= :maxVisitDate', {
        maxVisitDate: filters.maxVisitDate,
      });
    }
  }

  /**
   * Get all reservations with optional pagination and filtering. This method retrieves reservations from the database based on the provided page number, limit, and filter criteria. It applies the filters to the query builder, counts the total number of items matching the filters, and returns a paginated response containing the reservations and metadata about the pagination.
   *
   * @param page - The page number for pagination (default is 1)
   * @param limit - The number of items per page for pagination (default is 10)
   * @param filters - An object containing filter criteria for reservations, such as client phone, status, real estate ID, user ID of the real estate owner, and visit date range
   * @returns An object containing the paginated list of reservations and metadata about the pagination
   */
  async findAll(
    page: number,
    limit: number,
    filters: ReservationFilterDto,
  ): Promise<any> {
    const skip = (page - 1) * limit;

    const qb = this.reservationRepository
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.realEstate', 'realEstate')
      .groupBy('reservation.id')
      .addGroupBy('realEstate.id');

    //Apply filters
    this.applyFilters(qb, filters);

    if (filters.sortByVisitDate) {
      qb.orderBy(
        'reservation.visitDate',
        filters.sortByVisitDate.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    // Count
    const countQb = qb.clone();
    const totalItems = (await countQb.getRawMany()).length;

    // Pagination
    qb.skip(skip).take(limit);

    const reservations = await qb.getMany();

    return {
      items: reservations,
      meta: {
        totalItems,
        itemCount: reservations.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Get a single reservation by its ID. This method retrieves a reservation from the database based on the provided ID. If the reservation is not found, it throws a NotFoundException.
   *
   * @param id - The ID of the reservation to retrieve
   * @returns The reservation entity if found
   * @throws NotFoundException if the reservation with the specified ID does not exist
   */
  async findOne(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
      relations: ['realEstate'],
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  /**
   * Create a new reservation for a specific real estate listing. This method first checks if the specified real estate exists. If it does, it creates a new reservation using the provided data, associating it with the specified real estate and user. The created reservation is then saved to the database and returned.
   *
   * @param reservationData - An object containing the data for the new reservation, including client phone, CIN/passport number, visit date, and visit time
   * @param realEstateId - The ID of the real estate listing for which the reservation is being made
   * @param userId - The ID of the user making the reservation
   * @returns The created reservation entity
   * @throws NotFoundException if the specified real estate does not exist
   */
  async createReservation(
    reservationData: CreateReservationDto,
    realEstateId: string,
    userId: string,
  ): Promise<Reservation> {
    const realEstate = await this.realEstateRepository.findOneBy({
      id: realEstateId,
    });

    if (!realEstate) {
      throw new NotFoundException('Real Estate Not Found');
    }

    const oldReservation = await this.reservationRepository.findOneBy({
      realEstateId: realEstateId,
      userId: userId,
    });

    if (
      oldReservation &&
      oldReservation.status !== ReservationStatus.CANCELLED
    ) {
      throw new ConflictException(
        'A reservation already exists for this date and time',
      );
    }

    const reservation = this.reservationRepository.create({
      ...reservationData,
      realEstateId,
      userId,
    });

    return this.reservationRepository.save(reservation);
  }

  /**
   * Update an existing reservation. This method updates the details of a reservation based on the provided ID and update data.
   *
   * @param id - The ID of the reservation to update
   * @param dto - An object containing the update data for the reservation
   * @returns The updated reservation entity if found, or null if not found
   * @throws NotFoundException if the reservation with the specified ID does not exist
   */
  async updateReservation(
    id: string,
    dto: UpdateReservationDto,
  ): Promise<Reservation | null> {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const updateData = {
      ...dto,
    };

    await this.reservationRepository
      .createQueryBuilder()
      .update(Reservation)
      .set(updateData)
      .where('id = :id', { id })
      .execute();

    return this.reservationRepository.findOne({
      where: { id },
      relations: ['realEstate'],
    });
  }

  /**
   * Delete a reservation by its ID. This method removes a reservation from the database based on the provided ID. If the reservation is not found, it throws a NotFoundException.
   *
   * @param id - The ID of the reservation to delete
   * @returns A success message if the reservation is deleted
   * @throws NotFoundException if the reservation with the specified ID does not exist
   */
  async deleteReservation(id: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    await this.reservationRepository.delete(id);

    return { message: 'Reservation deleted successfully' };
  }

  /**
   * Find reservations by user ID. This method retrieves all reservations associated with a specific user ID. It returns the reservations along with their related real estate information, ordered by visit date in descending order.
   *
   * @param userId - The ID of the user whose reservations are to be retrieved
   * @returns An array of reservation entities associated with the specified user ID, including related real estate information
   */
  async findByUserId(userId: string) {
    return await this.reservationRepository.find({
      where: { userId },
      relations: ['realEstate'],
      order: { visitDate: 'DESC' },
    });
  }

  /**
   * Cancel a reservation. This method allows a user to cancel their own reservation if it is still pending. It checks if the reservation exists, if the user has permission to cancel it, and if the reservation is in a cancellable state before updating its status to cancelled.
   *
   * @param reservationId - The ID of the reservation to cancel
   * @param userId - The ID of the user attempting to cancel the reservation
   * @returns The updated reservation entity with status set to cancelled if successful
   * @throws NotFoundException if the reservation with the specified ID does not exist
   * @throws BadRequestException if the user does not have permission to cancel the reservation or if the reservation cannot be cancelled due to its current status
   */
  async cancelReservation(reservationId: string, userId: string) {
    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.userId !== userId) {
      throw new BadRequestException(
        'You can only cancel your own reservations',
      );
    }

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending reservations can be cancelled',
      );
    }

    reservation.status = ReservationStatus.CANCELLED;

    return await this.reservationRepository.save(reservation);
  }
}
