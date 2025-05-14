import { ActiveAccountDTO } from '@/modules/users/dto/active-account';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';
import { ERROR_CODE } from '@/shared/constants/common.constant';
import { ResponseDTO } from '@/shared/dto/base.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly usersService: UsersService,
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await this.usersService.compareHashedPassword(pass, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user

  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  handleRegister = async (registerDto: CreateAuthDto) => {
    return await this.usersService.handleRegister(registerDto)
  }

  async changePasswordFirstLogin(dto: ActiveAccountDTO): Promise<ResponseDTO> {
    // Decode token
    const decodeToken = this.jwtService.decode(dto.resetToken);
    const email = decodeToken['email'];
    const user = await this.usersService.findByEmail(email);
    // User not found
    if (!user) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.NOT_FOUND,
          message: 'User not found',
        },
      };
    }

    // Check reset token is valid
    if (user.resetToken !== dto.resetToken) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.TOKEN_INVALID,
          message: 'Reset token is invalid',
        },
      };
    }

    // Check reset token is not expired
    if (decodeToken['exp'] * 1000 <= new Date().getTime()) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.TOKEN_EXPIRED,
          message: 'Token expired',
        },
      };
    }

    // Check password is valid
    // if (user.password !== dto.oldPassword) {
    if (
      !(await this.usersService.compareHashedPassword(
        dto.oldPassword,
        user.password,
      ))
    ) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.OLD_PASSWORD_NOT_MATCH,
          message: 'Password not match',
        },
      };
    }

    // Hash password
    user.password = await this.usersService.hashPassword(dto.newPassword);
    user.isFirstLogin = false;
    user.resetToken = '';
    user.isActive = true;
    user.expiredIn = dayjs().add(60, 'day').toDate();

    const updateUser = await this.userRepository.save(user);
    delete (updateUser as Partial<User>).password;
    return {
      data: updateUser,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Reset password success',
      },
    };
  }
}