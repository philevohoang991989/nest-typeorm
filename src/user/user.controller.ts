import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Logger,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ApiTags } from '@nestjs/swagger';
import { NormalizeFilterPipe } from './pipes/normalize-filter.pipe';
import { FilterUserDTO } from './dto/user-filter.dto';
import { FindQueryDto } from 'src/shared/dto/find-query.dto';
import { NormalizeFindQueryPipe } from 'src/shared/pipes/normalize-find-query.pipe';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
  ) {}

  @Post('pagination')
  async pagination(
    @Body(NormalizeFilterPipe) filters: FilterUserDTO,
    @Query(NormalizeFindQueryPipe) query: FindQueryDto,
  ) {
    return this.userService.pagination(filters, query);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
