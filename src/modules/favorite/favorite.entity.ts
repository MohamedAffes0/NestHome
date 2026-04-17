import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { RealEstate } from '../real-estate/real-estate.entity';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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
}
