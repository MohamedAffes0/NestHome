import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RealEstate } from '../real-estate/real-estate.entity';
import { User } from '../user/user.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('decimal')
  amount!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date!: Date;

  @ManyToOne(() => RealEstate, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'realEstateId' })
  realEstate!: RealEstate;

  @Column({ name: 'realEstateId' })
  realEstateId!: string;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({ name: 'userId' })
  userId!: string;
}
