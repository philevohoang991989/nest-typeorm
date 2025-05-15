import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email dùng để đăng nhập',
  })
  @IsEmail()
  username: string; // passport local strategy mặc định là "username"

  @ApiProperty({
    example: 'strongPassword123',
    description: 'Mật khẩu của người dùng',
  })
  @IsString()
  password: string;
}
