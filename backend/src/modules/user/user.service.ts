import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { DeleteResult } from 'typeorm';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { auth } from 'src/utils/auth';
import {
  paginate,
  Pagination,
  IPaginationOptions,
  IPaginationMeta,
} from 'nestjs-typeorm-paginate';
import { CreateUserDto } from './dto/create-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UploadService } from '../upload/upload.service';

/**
 * Service for managing users.
 * Provides methods for retrieving, updating, deleting users,
 * changing passwords, and creating admin users.
 * Uses TypeORM for database interactions and Better Auth for authentication.
 * Handles profile image uploads via UploadService.
 * Includes pagination and filtering for user retrieval.
 * Throws appropriate exceptions for error handling.
 * @see User entity
 * @see UpdateProfileDto
 * @see ChangePasswordDto
 * @see CreateUserDto
 * @see UserFilterDto
 */
@Injectable()
export class UserService {
  // Injection du repository User
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Repository TypeORM pour User
    private readonly uploadService: UploadService, // Service to handle file uploads
  ) {}

  // Retrieve all users
  async findAll(
    page: number,
    limit: number,
    filters: UserFilterDto,
  ): Promise<Pagination<User, IPaginationMeta>> {
    const options: IPaginationOptions = { page, limit };

    const qb = this.userRepository.createQueryBuilder('user');

    // --- Email LIKE ---
    if (filters.email)
      qb.andWhere('user.email ILIKE :email', { email: `%${filters.email}%` });

    // --- Name LIKE ---
    if (filters.name)
      qb.andWhere('user.name ILIKE :name', { name: `%${filters.name}%` });
    // --- Role égal ---
    if (filters.role) qb.andWhere('user.role = :role', { role: filters.role });

    // --- createdAt >= createdAtMin ---
    if (filters.createdAtMin)
      qb.andWhere('user.createdAt >= :minDate', {
        minDate: filters.createdAtMin,
      });

    // --- createdAt <= createdAtMax ---
    if (filters.createdAtMax)
      qb.andWhere('user.createdAt <= :maxDate', {
        maxDate: filters.createdAtMax,
      });

    qb.orderBy('user.createdAt', 'DESC');

    return await paginate<User>(qb, options);
  }

  // Retrieve a user by ID
  async findOne(id: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Delete a user by ID (admin function)
  async deleteUser(userId: string): Promise<DeleteResult> {
    const user = await this.findOne(userId);

    // Check if user exists
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Delete user's profile image if exists
    if (user.image) {
      await this.uploadService.deleteFile(user.image);
    }

    return await this.userRepository.delete({ id: userId });
  }

  // Update a user's profile
  async updateProfile(
    userId: string,
    updatedData: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findOne(userId);

    // Check if user exists
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify if email is being updated and is unique
    if (updatedData.email && updatedData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updatedData.email },
      });
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Merge update data into user entity
    Object.assign(user, updatedData);

    // Save changes to TypeORM
    const updatedUser = await this.userRepository.save(user);

    return updatedUser;
  }

  // Change user password
  async changePassword(
    userId: string,
    passwordData: ChangePasswordDto,
    headers: Record<string, string>, // Token headers for authentication
  ) {
    const user = await this.findOne(userId);

    // Check if user exists
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Ensure new password is different from old password
    if (passwordData.currentPassword === passwordData.newPassword) {
      throw new BadRequestException(
        'New password must be different from the old password',
      );
    }

    try {
      // Call Better Auth API to change password
      await auth.api.changePassword({
        headers: headers,
        body: {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      });
    } catch (error: any) {
      const message =
        error instanceof Error ? error.message : 'Failed to change password';
      throw new BadRequestException(message);
    }
  }

  // Create an admin user
  async createAdminUser(userData: CreateUserDto): Promise<User> {
    const user = await auth.api.signUpEmail({
      body: {
        email: userData.email,
        password: userData.password,
        name: userData.name,
      },
    });

    const createdUser = await this.userRepository.findOne({
      where: { id: user.user?.id },
    });

    if (!createdUser)
      throw new BadRequestException('User not found after creation');

    createdUser.role = userData.role;
    createdUser.isActive = userData.isActive ?? true;
    await this.userRepository.save(createdUser);

    return createdUser;
  }

  // Update user's profile image
  async updateProfileImage(userId: string, imageUrl: string): Promise<User> {
    const user = await this.findOne(userId);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Delete old image if exists
    if (user.image) {
      await this.uploadService.deleteFile(user.image);
    }

    user.image = imageUrl;
    return await this.userRepository.save(user);
  }

  // Delete user's profile image
  deleteProfileImage(userId: string): Promise<User> {
    return this.updateProfileImage(userId, '');
  }

  // Activate or deactivate a user
  async updateActivateUser(userId: string, isActive: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.isActive = isActive;
    return this.userRepository.save(user);
  }

  async updateUserRole(userId: string, role: 'admin' | 'agent'): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.role = role;
    return this.userRepository.save(user);
  }
}
