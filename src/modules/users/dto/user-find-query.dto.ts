import { ApiPropertyOptional } from '@nestjs/swagger';
import { FindQueryDto } from 'src/shared/dto/find-query.dto';

export class UserFindQueryDto extends FindQueryDto {
  @ApiPropertyOptional()
  search?: string;

  @ApiPropertyOptional({
    description:
      '[+/-] user.id | user.email | user.name | user.address | user.createdAt | user.updatedAt',
  })
  sort?: string;
}
