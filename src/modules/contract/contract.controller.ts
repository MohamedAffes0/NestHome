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

import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { ContractFilterDto } from './dto/contract-filter.dto';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { Permission } from 'src/auth/types/permissions.types';

@Controller('contracts')
@UseGuards(PermissionsGuard)
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  // POST /contracts : create a new contract
  @Post()
  @RequirePermissions(Permission.CONTRACT_CREATE)
  create(@Body() dto: CreateContractDto, @CurrentUser() user: AuthUser) {
    return this.contractService.createContract(dto, user.id);
  }

  // GET /contracts : find all with filters and pagination
  @Get()
  @RequirePermissions(Permission.CONTRACT_VIEW)
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query() rawQuery: Record<string, any>,
  ) {
    const filters: ContractFilterDto = rawQuery;
    return this.contractService.findAll(page, limit, filters);
  }

  // GET /contracts/unpaid/expired : find all unpaid expired contracts (both sales and rentals)
  @Get('unpaid/expired')
  @RequirePermissions(Permission.CONTRACT_VIEW)
  findUnpaidExpired() {
    return this.contractService.findUnpaidExpiredContracts();
  }

  // GET /contracts/:id : retrieve a contract by ID
  @Get(':id')
  @RequirePermissions(Permission.CONTRACT_VIEW)
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  // PATCH /contracts/:id : update a contract by ID
  @Patch(':id')
  @RequirePermissions(Permission.CONTRACT_UPDATE)
  update(@Param('id') id: string, @Body() dto: UpdateContractDto) {
    return this.contractService.updateContract(id, dto);
  }

  // DELETE /contracts/:id : delete a contract by ID
  @Delete(':id')
  @RequirePermissions(Permission.CONTRACT_DELETE)
  remove(@Param('id') id: string) {
    return this.contractService.deleteContract(id);
  }
}
