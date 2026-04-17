import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { RealEstate } from '../real-estate/real-estate.entity';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,

    @InjectRepository(RealEstate)
    private readonly realEstateRepository: Repository<RealEstate>,
  ) {}

  /**
   * Get all favorites (for admin use only, not paginated)
   *
   * Returns an array of all favorite entries, including related real estate and user information. This method is intended for administrative use and is not paginated.
   */
  async findAll(): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      relations: ['realEstate', 'user'],
    });
  }

  /**
   * Find all favorites for a specific user
   *
   * @param userId - The ID of the user
   * @returns A promise resolving to an array of favorite entries for the user
   */
  async findByUser(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.find({
      where: { userId },
      relations: ['realEstate'],
    });
  }

  /**
   * Create a new favorite
   *
   * @param realEstateId - The ID of the real estate listing to add to favorites
   * @param userId - The ID of the user creating the favorite
   * @returns A promise resolving to the created favorite
   */
  async create(realEstateId: string, userId: string) {
    const realEstate = await this.realEstateRepository.findOne({
      where: { id: realEstateId },
    });

    if (!realEstate) {
      throw new NotFoundException('Real estate not found');
    }

    const existing = await this.favoriteRepository.findOne({
      where: {
        userId,
        realEstateId: realEstateId,
      },
    });

    if (existing) {
      throw new ConflictException('This property is already in favorites');
    }

    const favorite = this.favoriteRepository.create({
      userId,
      realEstateId: realEstateId,
    });

    return this.favoriteRepository.save(favorite);
  }

  /**
   * Delete a favorite by ID. Validates that the favorite exists and the user has permission to delete it.
   *
   * @param favoriteId - The ID of the favorite to delete
   * @param userId - The ID of the user attempting to delete the favorite
   * @returns A success message upon successful deletion
   */
  async delete(favoriteId: string, userId: string) {
    const favorite = await this.favoriteRepository.findOne({
      where: { id: favoriteId },
    });

    if (!favorite) {
      throw new NotFoundException('Favorite not found');
    }

    if (favorite.userId !== userId) {
      throw new NotFoundException(
        'You do not have permission to delete this favorite',
      );
    }

    await this.favoriteRepository.delete(favoriteId);

    return { message: 'Favorite removed successfully' };
  }

  /**
   * Switch favorite status for a real estate listing. If the listing is already in the user's favorites, it will be removed. If it is not in the favorites, it will be added.
   *
   * @param realEstateId - The ID of the real estate listing to toggle favorite status for
   * @param userId - The ID of the user toggling the favorite status
   * @returns A message indicating whether the favorite was added or removed
   */
  async switchFavorite(realEstateId: string, userId: string) {
    const realEstate = await this.realEstateRepository.findOne({
      where: { id: realEstateId },
    });

    if (!realEstate) {
      throw new NotFoundException('Real estate not found');
    }

    const existing = await this.favoriteRepository.findOne({
      where: {
        userId,
        realEstateId,
      },
    });

    if (existing) {
      await this.favoriteRepository.delete(existing.id);
      return { message: 'Favorite removed successfully' };
    }

    const favorite = this.favoriteRepository.create({
      userId,
      realEstateId,
    });

    await this.favoriteRepository.save(favorite);
    return { message: 'Favorite added successfully' };
  }
}
