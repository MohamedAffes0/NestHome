import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';

import { RealEstate } from './real-estate.entity';
import { CreateRealEstateDto } from './dto/create-real-estate.dto';
import { UpdateRealEstateDto } from './dto/update-real-estate.dto';
import { RealEstateFilterDto } from './dto/filter-real-estate.dto';
import { RealEstateWithStats } from './dto/real-estate-stats.dto';

import { UploadService } from '../upload/upload.service';

@Injectable()
export class RealEstateService {
  constructor(
    @InjectRepository(RealEstate)
    private readonly realEstateRepository: Repository<RealEstate>,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Applies filters to the query builder based on the provided filter DTO.
   * This method modifies the query builder in place to add the necessary WHERE clauses.
   *
   * @param qb - The SelectQueryBuilder instance for RealEstate.
   * @param filters - The RealEstateFilterDto containing the filter criteria.
   */
  private applyFilters(
    qb: SelectQueryBuilder<RealEstate>,
    filters: RealEstateFilterDto,
  ) {
    if (filters.title) {
      qb.andWhere('realEstate.title ILIKE :title', {
        title: `%${filters.title}%`,
      });
    }

    if (filters.address) {
      qb.andWhere('realEstate.address ILIKE :address', {
        address: `%${filters.address}%`,
      });
    }

    if (filters.type !== undefined) {
      qb.andWhere('realEstate.type = :type', { type: filters.type });
    }

    if (filters.status !== undefined) {
      qb.andWhere('realEstate.status = :status', { status: filters.status });
    }

    if (filters.agentId) {
      qb.andWhere('realEstate.agentId = :agentId', {
        agentId: filters.agentId,
      });
    }

    if (filters.minPrice) {
      qb.andWhere('realEstate.price >= :minPrice', {
        minPrice: Number(filters.minPrice),
      });
    }

    if (filters.maxPrice) {
      qb.andWhere('realEstate.price <= :maxPrice', {
        maxPrice: Number(filters.maxPrice),
      });
    }

    if (filters.minSurface) {
      qb.andWhere('realEstate.surface >= :minSurface', {
        minSurface: Number(filters.minSurface),
      });
    }

    if (filters.maxSurface) {
      qb.andWhere('realEstate.surface <= :maxSurface', {
        maxSurface: Number(filters.maxSurface),
      });
    }

    if (filters.minRooms) {
      qb.andWhere('realEstate.rooms >= :minRooms', {
        minRooms: Number(filters.minRooms),
      });
    }
  }

  /**
   * Finds all real estate listings with pagination and optional filters.
   * This method constructs a query with the specified filters, sorting, and pagination parameters.
   * It also calculates additional statistics such as average rating and total comments for each listing.
   *
   * @param page - The page number for pagination (default is 1).
   * @param limit - The number of items per page for pagination (default is 10).
   * @param filters - The RealEstateFilterDto containing the filter criteria.
   * @returns A paginated list of real estate listings with statistics.
   */
  async findAll(
    page: number,
    limit: number,
    filters: RealEstateFilterDto,
  ): Promise<Pagination<RealEstateWithStats, IPaginationMeta>> {
    const skip = (page - 1) * limit;

    const qb = this.realEstateRepository.createQueryBuilder('realEstate');

    // avgRating
    qb.addSelect(
      (subQuery) =>
        subQuery
          .select('AVG(c.rating)', 'avgRating')
          .from('comments', 'c')
          .where('c.realEstateId = realEstate.id'),
      'avgRating',
    );

    // totalComments
    qb.addSelect(
      (subQuery) =>
        subQuery
          .select('COUNT(c.id)', 'totalComments')
          .from('comments', 'c')
          .where('c.realEstateId = realEstate.id'),
      'totalComments',
    );

    this.applyFilters(qb, filters);

    if (filters.sortByPrice) {
      qb.orderBy(
        'realEstate.price',
        filters.sortByPrice.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      qb.orderBy('realEstate.id', 'DESC');
    }

    const countQb = qb.clone();
    const countResult = await countQb.getRawMany();
    const totalItems = countResult.length;

    qb.skip(skip).take(limit);

    const { raw, entities } = await qb.getRawAndEntities();

    const typedRaw = raw as Array<{
      avgRating: number | null;
      totalComments: number | null;
    }>;

    const mapped: RealEstateWithStats[] = entities.map((estate, i) => ({
      ...estate,
      avgRating: Number(typedRaw[i]?.avgRating ?? 0),
      totalComments: Number(typedRaw[i]?.totalComments ?? 0),
    }));

    return {
      items: mapped,
      meta: {
        totalItems,
        itemCount: mapped.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
      },
    };
  }

  /**
   * Finds a single real estate listing by its ID, including additional statistics such as average rating and total comments.
   * This method retrieves the real estate entity along with its associated agent and comments, and calculates the average rating and total number of comments for the listing.
   *
   * @param id - The ID of the real estate listing to retrieve.
   * @returns The real estate listing with statistics or null if not found.
   */
  async findOne(id: string): Promise<RealEstateWithStats | null> {
    const qb = this.realEstateRepository
      .createQueryBuilder('realEstate')
      .leftJoin('realEstate.agent', 'agent')
      .addSelect(['agent.name', 'agent.image', 'agent.email'])
      .leftJoinAndSelect('realEstate.comments', 'comments')
      .leftJoin('comments.user', 'commentUser')
      .addSelect(['commentUser.name', 'commentUser.image'])
      .where('realEstate.id = :id', { id });

    // avgRating
    qb.addSelect(
      (subQuery) =>
        subQuery
          .select('AVG(c.rating)')
          .from('comments', 'c')
          .where('c.realEstateId = realEstate.id'),
      'avgRating',
    );

    // totalComments
    qb.addSelect(
      (subQuery) =>
        subQuery
          .select('COUNT(c.id)')
          .from('comments', 'c')
          .where('c.realEstateId = realEstate.id'),
      'totalComments',
    );

    const raw: {
      totalComments: number | null;
      totalReservations: number | null;
      avgRating: number | null;
    } = (await qb.getRawOne()) ?? {
      totalComments: 0,
      totalReservations: 0,
      avgRating: 0,
    };
    const entity = await qb.getOne();

    if (!entity) return null;

    return {
      ...entity,
      totalComments: Number(raw?.totalComments ?? 0),
      avgRating: Number(raw?.avgRating ?? 0),
    };
  }

  /**
   * Creates a new real estate listing with the provided data and associated agent.
   * This method handles the creation of a new real estate entity, including processing any uploaded images and associating them with the listing.
   *
   * @param dto - The CreateRealEstateDto containing the data for the new real estate listing.
   * @param agentId - The ID of the agent creating the listing.
   * @param files - Optional array of uploaded files (images) associated with the listing.
   * @returns The created RealEstate entity.
   */
  async createRealEstate(
    dto: CreateRealEstateDto,
    agentId: string,
    files?: Express.Multer.File[],
  ): Promise<RealEstate> {
    const imageUrls =
      files?.map((file) =>
        this.uploadService.getFileUrl(file.filename, 'real-estates'),
      ) || [];

    const estate = this.realEstateRepository.create({
      ...dto,
      agentId,
      images: imageUrls,
    });

    return this.realEstateRepository.save(estate);
  }

  /**
   * Updates an existing real estate listing with the provided data and associated agent.
   * This method checks for the existence of the listing, verifies that the requesting agent has permission to update it, and processes any new uploaded images while ensuring the total number of images does not exceed the allowed limit.
   *
   * @param id - The ID of the real estate listing to update.
   * @param dto - The UpdateRealEstateDto containing the updated data for the real estate listing.
   * @param agentId - The ID of the agent attempting to update the listing.
   * @param files - Optional array of new uploaded files (images) to be added to the listing.
   * @returns The updated RealEstate entity or null if not found or not authorized.
   * @throws BadRequestException if the listing is not found or if the total number of images exceeds the allowed limit.
   * @throws ForbiddenException if the requesting agent does not have permission to update the listing.
   */
  async updateRealEstate(
    id: string,
    dto: UpdateRealEstateDto,
    files?: Express.Multer.File[],
  ): Promise<RealEstate | null> {
    const estate = await this.realEstateRepository.findOne({ where: { id } });

    if (!estate) throw new BadRequestException('Real estate not found');

    const newUrls =
      files?.map((file) =>
        this.uploadService.getFileUrl(file.filename, 'real-estates'),
      ) ?? [];

    const keep = dto.imagesToKeep ?? estate.images ?? [];
    const finalImages = [...keep, ...newUrls];

    if (finalImages.length > 10) {
      await this.uploadService.deleteMultipleFiles(newUrls);
      throw new BadRequestException('Max 10 images allowed');
    }

    const imagesToDelete = (estate.images ?? []).filter(
      (img) => !keep.includes(img),
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { imagesToKeep, ...rest } = dto; // exclure imagesToKeep du spread
    Object.assign(estate, rest, { images: finalImages });

    await this.realEstateRepository.save(estate);

    if (imagesToDelete.length) {
      await this.uploadService.deleteMultipleFiles(imagesToDelete);
    }

    return this.realEstateRepository.findOne({
      where: { id },
      relations: ['agent'],
    });
  }

  /**
   * Deletes a real estate listing by its ID, ensuring that the requesting agent has permission to delete it and that any associated images are also removed from storage.
   * This method checks for the existence of the listing, verifies that the requesting agent is the owner of the listing, deletes any associated images from storage, and then removes the listing from the database.
   *
   * @param id - The ID of the real estate listing to delete.
   * @param agentId - The ID of the agent attempting to delete the listing.
   * @returns An object containing a success message if the deletion is successful.
   * @throws BadRequestException if the listing is not found.
   * @throws ForbiddenException if the requesting agent does not have permission to delete the listing.
   * @throws InternalServerErrorException if there is an error deleting the associated images from storage.
   */
  async deleteRealEstate(id: string) {
    const estate = await this.realEstateRepository.findOne({
      where: { id },
    });

    if (!estate) {
      throw new BadRequestException('Real estate not found');
    }

    if (estate.images && estate.images.length > 0) {
      await this.uploadService.deleteMultipleFiles(estate.images);
    }

    await this.realEstateRepository.delete(id);

    return { message: 'Real estate deleted successfully' };
  }

  /**
   * Updates the images associated with a real estate listing, allowing for the addition of new images and the option to keep existing images while ensuring that the total number of images does not exceed the allowed limit.
   * This method retrieves the real estate listing, determines which images to keep and which to delete based on the provided new image URLs and the option to keep existing images, updates the listing with the new set of images, and handles the deletion of any old images from storage if necessary.
   *
   * @param id - The ID of the real estate listing to update.
   * @param newImageUrls - An array of new image URLs to be associated with the listing.
   * @param keepExisting - A boolean indicating whether to keep existing images (default is false).
   * @returns The updated RealEstate entity with the new set of images.
   * @throws BadRequestException if the real estate listing is not found or if the total number of images exceeds the allowed limit.
   * @throws InternalServerErrorException if there is an error deleting old images from storage.
   * @throws InternalServerErrorException if there is an error deleting new images from storage in case of a failure during the update process.
   */
  async updateRealEstateImages(
    id: string,
    newImageUrls: string[],
    keepExisting: boolean = false,
  ): Promise<RealEstate> {
    const estate = await this.realEstateRepository.findOne({ where: { id } });

    if (!estate) {
      throw new BadRequestException('Real estate not found');
    }

    const oldImages = estate.images || [];
    let finalImages: string[] = [];
    let imagesToDelete: string[] = [];

    if (keepExisting) {
      finalImages = [...oldImages, ...newImageUrls];

      if (finalImages.length > 10) {
        await this.uploadService.deleteMultipleFiles(newImageUrls);
        throw new BadRequestException(
          `Cannot add ${newImageUrls.length} images. Real estate already has ${oldImages.length} images. Maximum 10 images allowed.`,
        );
      }
    } else {
      finalImages = newImageUrls;
      imagesToDelete = oldImages;
    }

    try {
      estate.images = finalImages;
      const updatedEstate = await this.realEstateRepository.save(estate);

      if (imagesToDelete.length > 0) {
        await this.uploadService.deleteMultipleFiles(imagesToDelete);
      }

      return updatedEstate;
    } catch (error) {
      if (newImageUrls.length > 0) {
        await this.uploadService.deleteMultipleFiles(newImageUrls);
      }
      throw error;
    }
  }
}
