import { Category } from '@/modules/category/entities/category.entity';
import { OrderItem } from '@/modules/order/entities/order-item.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductAttributeValue } from './product-attribute-value.entity';
import { ProductImage } from './product-image.entity';
import { ProductType } from './product-type.entity';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // Các cột khác tùy bạn muốn
  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  category: Category;

  @ManyToOne(() => ProductType)
  productType: ProductType;

  @OneToMany(() => ProductAttributeValue, (val) => val.product, {
    cascade: true,
  })
  attributes: ProductAttributeValue[];

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
  })
  images: ProductImage[];

  @Column({ default: 0 })
  stock: number; // số lượng tồn kho hiện tại

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];
}
