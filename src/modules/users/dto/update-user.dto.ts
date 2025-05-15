import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDTO {
  @ApiProperty({ description: 'Email người dùng', example: 'abs@gmail.com' })
  email?: string;

  @ApiProperty({ description: 'Số điện thoại người dùng', example: '0970....' })
  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty({
    description: 'Địa chỉ người dùng',
    example: 'TP. Hồ Chí Minh',
  })
  @ApiPropertyOptional()
  address?: string;

  @ApiPropertyOptional()
  resetToken?: string;

  @ApiPropertyOptional()
  retryNumber?: number;

  @ApiPropertyOptional()
  blockAt?: Date;
}
