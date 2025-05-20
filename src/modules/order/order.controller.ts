import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Request } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

@Controller('order')
@ApiTags('Order')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    console.log(req.user);
    return this.orderService.create(req.user?.id as number, createOrderDto);
  }

  @Get('inventory-summary')
  @ApiOperation({ summary: 'Lấy thống kê tồn kho của tất cả sản phẩm' })
  async getInventorySummary() {
    return this.orderService.getInventorySummary();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng (completed hoặc cancelled)' })
  async updateOrderStatus(
    @Param('id', ParseIntPipe) orderId: number,
    @Body('status') newStatus: 'completed' | 'cancelled',
  ) {
    return this.orderService.updateOrderStatus(orderId, newStatus);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê tổng số đơn hàng và tổng doanh thu' })
  // @Roles('admin') // Chỉ admin được xem thống kê
  async getOrderStats() {
    return this.orderService.getOrderStats();
  }
}
