import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RealEstate } from '../real-estate/real-estate.entity';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(RealEstate)
    private readonly realEstateRepository: Repository<RealEstate>,
  ) {}

  /**
   * Get all comments (for admin use only, not paginated)
   */
  async findAll(): Promise<Comment[]> {
    return await this.commentRepository.find();
  }

  async findByRealEstateId(
    realEstateId: string,
    page: number,
    limit: number,
  ): Promise<Pagination<Comment>> {
    const options: IPaginationOptions = { page, limit };

    // Pass the condition in the 3rd argument
    return paginate<Comment>(this.commentRepository, options, {
      where: { realEstateId },
      order: { createdAt: 'DESC' },
      relations: ['user'],
    });
  }

  /**
   * Create a new comment for a real estate listing. Validates that the real estate exists before creating the comment.
   *
   * @param commentData - The data for the new comment, including content and realEstateId
   * @param userId - The ID of the user creating the comment
   * @returns The created comment
   */
  async create(
    commentData: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const realEstate = await this.realEstateRepository.findOne({
      where: { id: commentData.realEstateId },
    });

    // If real estate not found, throw NotFoundException
    if (!realEstate) throw new NotFoundException('Real Estate not found');

    const comment = this.commentRepository.create({
      ...commentData,
      userId,
    });

    return this.commentRepository.save(comment);
  }

  /**
   * Delete a comment by ID. Validates that the comment exists and the user has permission to delete it.
   *
   * @param commentId - The ID of the comment to delete
   * @param userId - The ID of the user attempting to delete the comment
   * @returns A success message upon successful deletion
   */
  async delete(commentId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });

    // If comment not found, throw NotFoundException
    if (!comment) throw new NotFoundException('Comment not found');

    // Verify user permission
    if (comment.userId !== userId) {
      throw new NotFoundException(
        'You do not have permission to delete this comment',
      );
    }

    await this.commentRepository.delete(commentId);

    return { message: 'Comment deleted successfully' };
  }
}
