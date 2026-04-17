import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { Comment } from '../comment/comment.entity';
import { Favorite } from '../favorite/favorite.entity';
import { Reservation } from '../reservation/reservation.entity';

// 0: House | 1: Apartment | 2: Land | 3: Business
export enum RealEstateType {
  HOUSE = 0,
  APARTMENT = 1,
  LAND = 2,
  BUSINESS = 3,
}

// 0: For Sale | 1: For Rent | 2: Sold | 3: Rented
export enum RealEstateStatus {
  FOR_SALE = 0,
  FOR_RENT = 1,
  SOLD = 2,
  RENTED = 3,
}

@Entity({ name: 'real_estates' })
export class RealEstate {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  title!: string;

  @Column('text')
  description!: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value !== null ? Number(value) : null),
    },
  })
  price!: number;

  @Column({ nullable: false })
  address!: string;

  @Column('float', { nullable: true })
  lat!: number | null;

  @Column('float', { nullable: true })
  lng!: number | null;

  @Column()
  type!: RealEstateType;

  @Column()
  status!: RealEstateStatus;

  @Column()
  condition!: string;

  @Column('simple-array', { nullable: true })
  images!: string[];

  @Column()
  rooms!: number;

  @Column('float')
  surface!: number;

  @Column()
  bathroom!: number;

  @Column('simple-array', { nullable: true })
  equipment!: string[];

  @ManyToOne(() => User, { eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'agentId' })
  agent!: User | null;

  @Column({ name: 'agentId' })
  agentId!: string | null;

  @OneToMany(() => Comment, (comment) => comment.realEstate, { eager: false })
  comments!: Comment[];

  @OneToMany(() => Favorite, (favorite) => favorite.realEstate, {
    eager: false,
  })
  favorites!: Favorite[];

  @OneToMany(() => Reservation, (reservation) => reservation.realEstate, {
    eager: false,
  })
  reservations!: Reservation[];
}
