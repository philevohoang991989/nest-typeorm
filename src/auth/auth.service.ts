/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MailService } from '@/mail/mail.service';
import { ActiveAccountDTO } from '@/modules/users/dto/active-account';
import { User } from '@/modules/users/entities/user.entity';
import { UsersService } from '@/modules/users/users.service';
import { ERROR_CODE } from '@/shared/constants/common.constant';
import { ResponseDTO } from '@/shared/dto/base.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { pattern } from './constants';
import { CreateAuthDto } from './dto/create-auth.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await this.usersService.compareHashedPassword(
      pass,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async login(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  handleRegister = async (registerDto: CreateAuthDto) => {
    return await this.usersService.handleRegister(registerDto);
  };

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

  async requestResetPassword(
    email: string,
    language: string,
  ): Promise<ResponseDTO> {
    const user = await this.validateUsername(email);
    if (!user) {
      return {
        data: undefined,
        msgSts: {
          message: 'User not found',
          code: ERROR_CODE.USER_NOT_FOUND,
        },
      };
    }

    // Generate token: email
    const payload = {
      email: user.email,
      userId: user.id,
    };
    // Send email with reset_token
    const reset_token = this.jwtService.sign(payload, {
      expiresIn: '48h',
    });
    const link = `${this.configService.get('DOMAIN_URL')}/reset-password?token=${reset_token}`;
    const rs = await this.mailService.sendResetPassEmail(
      link,
      email,
      language,
      user.name,
    );

    if (rs) {
      // Save reset token
      await this.usersService.update(user.id, { resetToken: reset_token });
      return {
        data: undefined,
        msgSts: {
          message: 'Request reset password success',
          code: ERROR_CODE.SUCCESS,
        },
      };
    } else {
      return {
        data: undefined,
        msgSts: {
          message: 'Request reset password failed: Email does not work',
          code: ERROR_CODE.EMAIL_DOES_NOT_WORK,
        },
      };
    }
  }

  async resetPassword(data: ResetPasswordDTO): Promise<ResponseDTO> {
    if (!pattern.test(data.newPassword)) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.NOT_FOUND,
          message:
            'Password length must be at least 8 characters, letters, numbers and special characters.',
        },
      };
    }

    if (!data.resetToken) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.TOKEN_NOT_FOUND,
          message: 'Token not found',
        },
      };
    }

    const decodeToken = this.jwtService.decode(data.resetToken);
    const username = decodeToken['username'];
    const user = await this.usersService.findByEmail(username);
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

    // Token invalid
    if (user.resetToken !== data.resetToken) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.TOKEN_INVALID,
          message: 'Token invalid',
        },
      };
    }

    //Token expired
    if (decodeToken['exp'] * 1000 <= new Date().getTime()) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.TOKEN_EXPIRED,
          message: 'Token expired',
        },
      };
    }

    data.username = username;
    return await this.usersService.resetPassword(data);
  }
  private async validateUsername(email: string): Promise<User | undefined> {
    const user = await this.usersService.findByEmail(email);
    if (user) {
      delete (user as Partial<User>).password;
      return user;
    }
    return undefined;
  }
}
