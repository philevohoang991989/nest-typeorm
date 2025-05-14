import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { MailService } from '@/mail/mail.service';
import { ERROR_CODE, UserRole } from '@/shared/constants/common.constant';
import { ResponseDTO } from '@/shared/dto/base.dto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) { }
  async register(registerDto: CreateUserDTO): Promise<ResponseDTO> {
    const isExistedUser = await this.userRepository.findOne({
      where: {
        email: registerDto.email.toLocaleLowerCase(),
      },
    });
    if (isExistedUser) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.EMAIL_EXISTED,
          message: 'Username is existed',
        },
      };
    }

    // Generate password | token (expires in 48hours) and send email
    const reset_token = this.jwtService.sign({
      email: registerDto.email,
    });

    const newUser = new User();
    newUser.name = registerDto.name;
    newUser.retryNumber = 0;
    newUser.email = registerDto.email;
    newUser.password = await this.hashPassword(registerDto.password);
    newUser.address = registerDto.address;
    newUser.resetToken = reset_token
    newUser.phone = registerDto.phone;
    newUser.isFirstLogin = false;
    newUser.roleId = registerDto.role || UserRole.Users;
    const user = await this.userRepository.save(newUser);
    const loginUrl = `${this.configService.get('APP_URL')}/active-account?token=${reset_token}`;

    this.mailService.sendWelcomeEmail(loginUrl, user.email, registerDto.password)

    // Remove sensitive data
    delete (user as Partial<User>).password;
    // delete (user as Partial<User>).resetToken;
    return {
      data: user,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Register success',
      },
    };
  }
  async hashPassword(plainPassword: string) {
    return bcrypt.hash(plainPassword, 10);
  }

  async compareHashedPassword(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed);
  }
  async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email: email } });
  }

  async handleRegister(registerDto: CreateAuthDto) {
    const isExistedUser = await this.userRepository.findOne({
      where: {
        email: registerDto.email.toLocaleLowerCase(),
      },
    });
    if (isExistedUser) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.EMAIL_EXISTED,
          message: 'Username is existed',
        },
      };
    }

    // Generate password | token (expires in 48hours) and send email
    // const reset_token = this.jwtService.sign({
    //   username: registerDto.email,
    // });

    const newUser = new User();
    newUser.name = registerDto.name;
    newUser.retryNumber = 0;
    newUser.email = registerDto.email;
    newUser.password = await this.hashPassword(registerDto.password);
    newUser.address = registerDto.address;
    newUser.phone = registerDto.phone;
    newUser.isFirstLogin = false;
    newUser.roleId = 2;
    const user = await this.userRepository.save(newUser);


    // Remove sensitive data
    delete (user as Partial<User>).password;
    return {
      data: user,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Register success',
      },
    };
  }
}
