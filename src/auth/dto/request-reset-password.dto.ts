import { ApiProperty } from '@nestjs/swagger';

export class RequestResetPasswordDTO {
  @ApiProperty({ example: 'abc@gmail.com' })
  email: string;

  @ApiProperty({ example: 'VN' })
  language: string;
}
