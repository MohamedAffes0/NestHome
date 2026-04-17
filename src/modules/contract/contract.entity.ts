import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../user/user.entity';
import { RealEstate } from '../real-estate/real-estate.entity';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  cinPassport!: string;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date', nullable: true })
  endDate!: Date | null;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ name: 'userId' })
  userId!: string;

  @ManyToOne(() => User, { eager: false, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'agentId' })
  agent?: User;

  @Column({ name: 'agentId', nullable: true })
  agentId!: string;

  @OneToOne(() => RealEstate, { eager: false, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'realEstateId' })
  realEstate?: RealEstate;

  @Column({ name: 'realEstateId', nullable: true })
  realEstateId!: string;
}
