import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
import { Permission } from 'src/auth/types/permissions.types';
import { DeleteResult } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { Query } from '@nestjs/common';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';
import { CreateUserDto } from './dto/create-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';
import { multerConfig } from 'src/config/multer.config';

@Controller('users')
@UseGuards(PermissionsGuard)
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadService: UploadService, // Service to handle file uploads
  ) {}

  // GET /users → retrieve all users
  @Get()
  @RequirePermissions(Permission.USERS_VIEW)
  getAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query() rawQuery: Record<string, any>,
  ): Promise<Pagination<User, IPaginationMeta>> {
    const filters: UserFilterDto = rawQuery;
    return this.userService.findAll(page, limit, filters);
  }

  // PATCH /users/profile/me → update current user's profile
  @Patch('/profile/me')
  updateMyProfile(
    @CurrentUser() user: AuthUser,
    @Body() updatedData: UpdateProfileDto,
  ): Promise<User> {
    return this.userService.updateProfile(user.id, updatedData);
  }

  // GET /users/profile/me → get current user's profile
  @Get('/profile/me')
  getMyProfile(@CurrentUser() user: AuthUser) {
    return this.userService.findOne(user.id);
  }

  // PATCH /users/profile/password → change current user's password
  @Patch('/profile/password')
  async updatePassword(
    @CurrentUser() user: AuthUser,
    @Body() passwordData: ChangePasswordDto,
    @Req() request: Request,
  ) {
    await this.userService.changePassword(
      user.id,
      passwordData,
      request.headers as unknown as Record<string, string>, // Passez les headers
    );
    return { message: 'Password changed successfully' };
  }

  // GET /users/:id → retrieve a user by ID
  @Get(':id')
  @RequirePermissions(Permission.USERS_VIEW)
  getOne(@Param('id') id: string): Promise<User | null> {
    return this.userService.findOne(id);
  }

  // DELETE /users/me → delete current user's profile
  @Delete('me')
  async deleteMyProfile(@CurrentUser() user: AuthUser) {
    return this.userService.deleteUser(user.id);
  }

  // DELETE /users/:id → delete a user by ID (admin only)
  @Delete(':id')
  @RequirePermissions(Permission.USERS_DELETE)
  deleteUser(@Param('id') id: string): Promise<DeleteResult> {
    return this.userService.deleteUser(id);
  }

  // PATCH /users/:id → update a user's profile (admin only)
  @Patch(':id')
  @RequirePermissions(Permission.USERS_UPDATE)
  updateUser(
    @Param('id') id: string,
    @Body() updatedData: UpdateProfileDto,
  ): Promise<User> {
    return this.userService.updateProfile(id, updatedData);
  }

  // POST /users/admin → create a new admin user (admin only)
  @Post('/admin')
  @RequirePermissions(Permission.ADMIN_USER_CREATE)
  createAdminUser(@Body() userData: CreateUserDto): Promise<User> {
    return this.userService.createAdminUser(userData);
  }

  // PATCH /users/profile/me/image → update current user's profile image
  @Patch('/profile/me/image')
  @UseInterceptors(FileInterceptor('profileImage', multerConfig))
  async updateMyProfileImage(
    @CurrentUser() user: AuthUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    this.uploadService.validateFile(file);
    const imageUrl = this.uploadService.getFileUrl(file.filename, 'profiles');
    return this.userService.updateProfileImage(user.id, imageUrl);
  }

  // DELETE /users/profile/me/image → delete current user's profile image
  @Delete('/profile/me/image')
  async deleteMyProfileImage(@CurrentUser() user: AuthUser): Promise<User> {
    return this.userService.deleteProfileImage(user.id);
  }

  // PATCH /users/isActive/:id → activate or deactivate a user (admin only)
  @Patch('/isActive/:id')
  @RequirePermissions(Permission.ADMIN_USER_ACTIVATE)
  async updateActivateUser(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.userService.updateActivateUser(id, isActive);
  }

  // PATCH /users/role/:id → update a user's role (admin only)
  @Patch('/role/:id')
  @RequirePermissions(Permission.UPDATE_USER_ROLE)
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: 'admin' | 'agent',
  ) {
    return this.userService.updateUserRole(id, role);
  }
}
