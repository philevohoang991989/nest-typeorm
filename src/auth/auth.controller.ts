import { Public } from '@/decorator/public.decorator';
import { ActiveAccountDTO } from '@/modules/users/dto/active-account';
import { ResponseDTO } from '@/shared/dto/base.dto';
import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';

@Controller('auth')
@ApiTags('Auths')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Public()
  handleLogin(@Request() req) {
    return this.authService.login(req.user)
  }


  @Post('register')
  @Public()
  getProfile(@Body() registerDto: CreateAuthDto) {
    return this.authService.handleRegister(registerDto)
  }

  @Post('active-account')
  @Public()
  async activeAccount(@Body() dto: ActiveAccountDTO): Promise<ResponseDTO> {
    return this.authService.changePasswordFirstLogin(dto);
  }
}
