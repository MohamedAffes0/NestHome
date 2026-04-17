import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationFilterDto } from './dto/reservation-filter.dto';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { Permission } from 'src/auth/types/permissions.types';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user';

@Controller('reservations')
@UseGuards(PermissionsGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  // POST /reservations/:realEstateId : create a new reservation
  @Post(':realEstateId')
  @RequirePermissions(Permission.RESERVATION_CREATE)
  async create(
    @Param('realEstateId') realEstateId: string,
    @CurrentUser() user: AuthUser,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    return await this.reservationService.createReservation(
      createReservationDto,
      realEstateId,
      user.id,
    );
  }

  // GET /reservations : find all with filters and pagination
  @Get()
  @RequirePermissions(Permission.MANAGE_RESERVATIONS)
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query() rawQuery: Record<string, any>,
  ) {
    const filters: ReservationFilterDto = rawQuery;
    return this.reservationService.findAll(page, limit, filters);
  }

  // GET /reservations/user/me : find reservations for the current authenticated user
  @Get('user/me')
  findByUser(@CurrentUser() user: AuthUser) {
    return this.reservationService.findByUserId(user.id);
  }

  // GET /reservations/:id : retrieve a reservation by ID
  @Get(':id')
  @RequirePermissions(Permission.MANAGE_RESERVATIONS)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationService.findOne(id);
  }

  // PATCH /reservations/:id : update a reservation by ID
  @Patch(':id')
  @RequirePermissions(Permission.MANAGE_RESERVATIONS)
  async update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return await this.reservationService.updateReservation(
      id,
      updateReservationDto,
    );
  }

  // PATCH /reservations/:id/cancel : cancel a reservation by ID (sets status to 'cancelled')
  @Patch(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reservationService.cancelReservation(id, user.id);
  }

  // DELETE /reservations/:id : delete a reservation by ID
  @Delete(':id')
  @RequirePermissions(Permission.MANAGE_RESERVATIONS)
  remove(@Param('id') id: string) {
    return this.reservationService.deleteReservation(id);
  }
}
