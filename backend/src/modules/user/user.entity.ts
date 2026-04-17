import { IsEmail, IsUrl } from 'class-validator';
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'user', synchronize: false })
export class User {
  @PrimaryColumn('text')
  id!: string;

  @Column()
  @IsEmail()
  email!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  @IsUrl()
  image!: string;

  @Column({
    nullable: true,
    type: 'enum',
    enum: ['agent', 'admin', 'user'],
    default: 'user',
  })
  role!: 'agent' | 'admin' | 'user';

  @Column({
    nullable: true,
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
