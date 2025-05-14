import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsStrongPassword } from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({ description: 'Tên người dùng', example: 'Nguyễn Văn A' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Email người dùng', example: 'abd@gmail.com' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email message' })
  email: string;

  @ApiProperty()
  address: string;

  @ApiProperty({ description: 'Số điện thoại người dùng', example: '0970....' })
  @IsOptional()
  phone: string;

  @ApiProperty({
    description: 'Mật khẩu mạnh',
    example: 'StrongP@ss123',
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({ description: 'ID của role', example: 1 })
  @IsOptional()
  role: number;


}
