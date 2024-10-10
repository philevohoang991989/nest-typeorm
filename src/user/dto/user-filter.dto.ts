import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FilterUserDTO {
  @ApiProperty()
  keyword?: string;

  @ApiPropertyOptional()
  sol: number;

  @ApiPropertyOptional()
  role: number;
}
