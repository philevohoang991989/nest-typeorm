import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>,
  ) { }
  async create(userId: number, createOrderDto: CreateOrderDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const order = this.orderRepository.create({
      user,
      note: createOrderDto.note,
      status: 'pending',
      items: [],
    });
    let total = 0;
    for (const item of createOrderDto.items) {
      const product = await this.productRepository.findOneBy({ id: item.productId });

      if (!product || product.stock < item.quantity) {
        throw new BadRequestException(`Sản phẩm ${product?.name ?? item.productId} không đủ hàng`);
      }

      // Trừ tồn kho
      product.stock -= item.quantity;
      await this.productRepository.save(product);

      // Tạo OrderItem
      const orderItem = this.orderItemRepository.create({
        product,
        quantity: item.quantity,
        price: item.price,
      });

      order.items.push(orderItem);
      total += item.quantity * item.price;
    }

    order.totalAmount = total;
    return this.orderRepository.save(order);
  }

  async getInventorySummary(): Promise<{ product: string; stock: number }[]> {
    const products = await this.productRepository.find();

    return products.map((p) => ({
      product: p.name,
      stock: p.stock,
    }));
  }

  async updateOrderStatus(orderId: number, newStatus: 'completed' | 'cancelled'): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product'],
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    if (order.status === 'cancelled') {
      throw new BadRequestException('Đơn hàng đã bị huỷ trước đó');
    }

    if (newStatus === 'cancelled') {
      // Rollback tồn kho
      for (const item of order.items) {
        item.product.stock += item.quantity;
        await this.productRepository.save(item.product);
      }
    }

    order.status = newStatus;
    return this.orderRepository.save(order);
  }

  async getOrderStats() {
    const [totalOrders, rawRevenue] = (await Promise.all([
      this.orderRepository.count({ where: { status: 'completed' } }),
      this.orderRepository
        .createQueryBuilder('order')
        .select('SUM(order.totalAmount)', 'total')
        .where('order.status = :status', { status: 'completed' })
        .getRawOne(),
    ])) as [number, { total: string | null }];

    return {
      totalOrders,
      totalRevenue: Number(rawRevenue.total ?? 0),
    };
  }
}
