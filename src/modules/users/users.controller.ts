import { ResponseDTO } from '@/shared/dto/base.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  // @UseGuards(RolesGuard)
  // @Roles(UserRole.Admin)
  async create(@Body() createUserDTO: CreateUserDTO): Promise<ResponseDTO> {
    return this.usersService.register(createUserDTO);
  }



}
