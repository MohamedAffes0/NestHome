import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  Body,
} from '@nestjs/common';

import { FavoriteService } from './favorite.service';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user';
import { FavoriteDto } from './dto/favorite.dto';

@Controller('favorites')
@UseGuards(PermissionsGuard)
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  // GET /favorites
  @Get()
  async getAllFavorites() {
    return this.favoriteService.findAll();
  }

  // GET /favorites/user
  @Get('user')
  async getUserFavorites(@CurrentUser() user: AuthUser) {
    return this.favoriteService.findByUser(user.id);
  }

  // POST /favorites
  @Post()
  async addFavorite(@CurrentUser() user: AuthUser, @Body() body: FavoriteDto) {
    return this.favoriteService.create(body.realEstateId, user.id);
  }

  // DELETE /favorites/:favoriteId
  @Delete(':favoriteId')
  async deleteFavorite(
    @Param('favoriteId', ParseUUIDPipe) favoriteId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.favoriteService.delete(favoriteId, user.id);
  }

  // POST /favorites/switch
  @Post('switch')
  async switchFavorite(
    @CurrentUser() user: AuthUser,
    @Body() body: FavoriteDto,
  ) {
    return this.favoriteService.switchFavorite(body.realEstateId, user.id);
  }
}
