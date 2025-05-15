import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAuthDto {
  @ApiProperty({ description: 'Email người dùng', example: 'abd@gmail.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email message' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({ description: 'Tên người dùng', example: 'Nguyễn Văn A' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Địa chỉ người dùng', example: '15D đường 12' })
  @IsOptional()
  address: string;

  @ApiProperty({ description: 'Số điện thoại người dùng', example: '0970....' })
  @IsOptional()
  phone: string;

  @ApiProperty({ description: 'ID của role', example: 1 })
  @IsOptional()
  role: number;
}
