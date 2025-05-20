import { ResponseDTO } from '@/shared/dto/base.dto';
import { Pagination } from '@/shared/dto/pagination.dto';
import { NormalizeFindQueryPipe } from '@/shared/pipes/normalize-find-query.pipe';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserFindQueryDto } from './dto/user-find-query.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  async create(@Body() createUserDTO: CreateUserDTO): Promise<ResponseDTO> {
    return this.usersService.register(createUserDTO);
  }

  @Get('me')
  async getCurrentUser(@Request() req): Promise<User> {
    return await this.usersService.findById(req.user?.id as number);
  }

  @Get(':id')
  async getDetailUser(@Param('id', ParseIntPipe) id: number): Promise<User> {
    return await this.usersService.findById(id);
  }
  @Get()
  async getAllUsers(@Query(NormalizeFindQueryPipe) query: UserFindQueryDto, @Request() req): Promise<Pagination<User>> {
    try {
      return await this.usersService.paginate(query, req.user);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDTO): Promise<ResponseDTO> {
    try {
      return await this.usersService.update(id, dto);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Request() req): Promise<User> {
    try {
      return await this.usersService.remove(id, req.user);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
