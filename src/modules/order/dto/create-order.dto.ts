import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: 1, description: 'ID của sản phẩm' })
  productId: number;

  @ApiProperty({ example: 2, description: 'Số lượng mua' })
  quantity: number;

  @ApiProperty({ example: 50000, description: 'Giá tại thời điểm đặt hàng (VNĐ)' })
  price: number;
}

export class CreateOrderDto {
  @ApiProperty({
    type: [CreateOrderItemDto],
    description: 'Danh sách sản phẩm trong đơn hàng',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({
    required: false,
    example: 'Giao hàng giờ hành chính',
    description: 'Ghi chú thêm cho đơn hàng',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
