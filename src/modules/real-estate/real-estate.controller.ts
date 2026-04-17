import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';

import { FilesInterceptor } from '@nestjs/platform-express';

import { RealEstateService } from './real-estate.service';
import { CreateRealEstateDto } from './dto/create-real-estate.dto';
import { UpdateRealEstateDto } from './dto/update-real-estate.dto';
import { RealEstateFilterDto } from './dto/filter-real-estate.dto';

import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Public } from 'src/auth/decorators/public.decorator';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { Permission } from 'src/auth/types/permissions.types';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user';

import { multerConfig } from 'src/config/multer.config';
import { UploadService } from '../upload/upload.service';
import { CleanupFilesInterceptor } from '../upload/interceptors/cleanup-files.interceptor';

@Controller('real-estate')
@UseGuards(PermissionsGuard)
export class RealEstateController {
  constructor(
    private readonly realEstateService: RealEstateService,
    private readonly uploadService: UploadService,
  ) {}

  // GET /real-estate?page=1&limit=20&title=house&type=0&status=1&minPrice=100000&maxPrice=500000&sortByPrice=asc
  @Get()
  @Public()
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query() rawQuery: Record<string, any>,
  ) {
    const filters: RealEstateFilterDto = rawQuery;
    return this.realEstateService.findAll(page, limit, filters);
  }

  // GET /real-estate/:id
  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.realEstateService.findOne(id);
  }

  // POST /real-estate
  @Post()
  @RequirePermissions(Permission.REAL_ESTATE_CREATE)
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateRealEstateDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (files && files.length > 0) {
      this.uploadService.validateFiles(files);
    }

    return this.realEstateService.createRealEstate(dto, user.id, files);
  }

  // PATCH /real-estate/:id
  @Patch(':id')
  @RequirePermissions(Permission.REAL_ESTATE_UPDATE)
  @UseInterceptors(FilesInterceptor('images', 10, multerConfig))
  async updateRealEstate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRealEstateDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (files && files.length > 0) {
      this.uploadService.validateFiles(files);
    }

    return this.realEstateService.updateRealEstate(id, dto, files);
  }

  // PATCH /real-estate/:id/images : update real estate images
  @Patch(':id/images')
  @UseGuards(PermissionsGuard)
  @RequirePermissions(Permission.REAL_ESTATE_UPDATE)
  @UseInterceptors(
    FilesInterceptor('images', 10, multerConfig),
    CleanupFilesInterceptor,
  )
  async updateImages(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('replaceAll') replaceAll?: string, // 'true' or 'false'
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images provided');
    }

    this.uploadService.validateFiles(files);

    const newImageUrls = files.map((file) =>
      this.uploadService.getFileUrl(file.filename, 'real-estate'),
    );

    const shouldReplaceAll = replaceAll === 'true';

    return await this.realEstateService.updateRealEstateImages(
      id,
      newImageUrls,
      !shouldReplaceAll, // keepExisting in the real estate service
    );
  }

  // DELETE /real-estate/:id
  @Delete(':id')
  @RequirePermissions(Permission.REAL_ESTATE_DELETE)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.realEstateService.deleteRealEstate(id);
  }
}
