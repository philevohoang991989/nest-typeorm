import { BaseEntity } from '@/shared/entity/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { Order } from '@/modules/order/entities/order.entity';

@Entity({
  name: 'users',
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'email',
  })
  email: string;

  @Column({
    name: 'password',
  })
  password: string;

  @Column({
    name: 'name',
  })
  name: string;

  @Column({
    name: 'address',
  })
  address: string;

  @Column({
    name: 'phone',
  })
  phone: string;

  @Column({
    name: 'avatar',
    default: '',
  })
  avatar: string;

  @Column({
    name: 'account_type',
    default: 'LOCAL',
  })
  accountType: string;

  @Column({ name: 'role', nullable: true })
  roleId: number;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role' })
  role: Role;

  @Column({
    name: 'reset_token',
    nullable: true,
  })
  resetToken: string;

  @Column({
    name: 'is_active',
    default: false,
  })
  isActive: boolean;

  @Column({
    name: 'is_first_login',
    default: false,
  })
  isFirstLogin: boolean;

  @Column({
    name: 'expired_in',
    type: 'timestamptz',
    nullable: true,
  })
  expiredIn: Date;

  @Column({
    name: 'retry_number',
    nullable: true,
  })
  retryNumber: number;

  // Unlock after 30 mins from last try
  @Column({
    name: 'block_at',
    type: 'timestamptz',
    nullable: true,
  })
  blockAt: Date | undefined | null;

  @OneToMany(() => Order, order => order.user)
  orders: Order[];
}
