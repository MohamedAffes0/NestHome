import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Data Transfer Object for updating user profile.
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;
}
