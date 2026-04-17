import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { RealEstate } from '../real-estate/real-estate.entity';

export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  clientPhone!: string;

  @Column({ nullable: false })
  cinPassport!: string;

  @Column({ type: 'date' })
  visitDate!: Date;

  @Column({ type: 'time' })
  visitTime!: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status!: ReservationStatus;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ name: 'userId' })
  userId!: string;

  @ManyToOne(() => RealEstate, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'realEstateId' })
  realEstate?: RealEstate;

  @Column({ name: 'realEstateId' })
  realEstateId!: string;
}
