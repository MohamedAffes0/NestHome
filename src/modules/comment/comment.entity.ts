import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { RealEstate } from '../real-estate/real-estate.entity';
import { Max, Min } from 'class-validator';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', nullable: false })
  content!: string;

  @Column({ nullable: false })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating!: number;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ name: 'userId' })
  userId!: string;

  @ManyToOne(() => RealEstate, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'realEstateId' })
  realEstate!: RealEstate;

  @Column({ name: 'realEstateId' })
  realEstateId!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
