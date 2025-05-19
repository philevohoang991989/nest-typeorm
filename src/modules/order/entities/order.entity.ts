import { Entity } from 'typeorm';
import { PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';

@Entity({ name: 'order' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.orders)
  user: User;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];

  @Column()
  totalAmount: number;

  @Column({ nullable: true })
  note: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'cancelled';

  @CreateDateColumn()
  createdAt: Date;
}
