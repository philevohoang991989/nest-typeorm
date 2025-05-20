import { CreateAuthDto } from '@/auth/dto/create-auth.dto';
import { ResetPasswordDTO } from '@/auth/dto/reset-password.dto';
import { MailService } from '@/mail/mail.service';
import { ERROR_CODE, UserRole } from '@/shared/constants/common.constant';
import { ResponseDTO } from '@/shared/dto/base.dto';
import { Pagination } from '@/shared/dto/pagination.dto';
import { getOrderByClause } from '@/shared/helpers/query-sort.helper';
import { AuthPayload } from '@/shared/interface/auth-payload.interface';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserFindQueryDto } from './dto/user-find-query.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
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
    newUser.resetToken = reset_token;
    newUser.phone = registerDto.phone;
    newUser.isFirstLogin = false;
    newUser.roleId = registerDto.role || UserRole.Users;
    const user = await this.userRepository.save(newUser);
    const loginUrl = `${this.configService.get('APP_URL')}/active-account?token=${reset_token}`;

    this.mailService.sendWelcomeEmail(loginUrl, user.email, registerDto.password);

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

  async update(id: number, updateUserDto: UpdateUserDTO): Promise<ResponseDTO> {
    const user = await this.userRepository.findOne({ where: { id: id } });

    if (!user) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.NOT_FOUND,
          message: 'User not found',
        },
      };
    }
    if (updateUserDto.address) {
      user.address = updateUserDto.address;
    }
    if (updateUserDto.phone) {
      user.phone = updateUserDto.phone;
    }
    if (updateUserDto.resetToken) {
      user.resetToken = updateUserDto.resetToken ?? '';
    }
    if (updateUserDto.retryNumber !== undefined) {
      user.retryNumber = updateUserDto.retryNumber;
    }
    if (updateUserDto.blockAt) {
      user.blockAt = updateUserDto.blockAt;
    }

    const userNew = await this.userRepository.save(user);

    delete (userNew as Partial<User>).password;

    return {
      data: userNew,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Update user success',
      },
    };
  }

  async paginate(filter: UserFindQueryDto, authUser: AuthPayload): Promise<Pagination<User>> {
    const qb = this.userRepository.createQueryBuilder('users');
    console.log({ qb });

    const search = filter?.search?.trim().toLowerCase();
    if (search) {
      qb.andWhere(`( LOWER(users.email) like :search OR LOWER(users.name) like :search  )`, {
        search: `%${search}%`,
      });
    }

    const sortData = getOrderByClause(filter?.sort?.trim() ?? '-users.id');
    const sortKey = Object.keys(sortData).pop();
    if (sortKey && ['users.email', 'users.name'].includes(sortKey)) {
      qb.addOrderBy(`LOWER(${sortKey})`, Object.values(sortData).pop() == 'DESC' ? 'DESC' : 'ASC');
    } else {
      qb.orderBy(sortData);
    }

    // obtain every user besides the one who is logged in at the moment.
    qb.andWhere(`id != :userId`, { userId: authUser.id });
    // qb.andWhere(`user.roleId != :roleAdminId`, { roleAdminId: ROLE.ADMIN });

    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 10;

    const results = await qb
      .offset(limit * (page - 1))
      .limit(limit)
      .getManyAndCount();

    return new Pagination(results);
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOneOrFail({
      where: {
        id: id,
      },
    });
    delete (user as Partial<User>).password;
    return user;
  }

  async hashPassword(plainPassword: string) {
    return await bcrypt.hash(plainPassword, 10);
  }

  async compareHashedPassword(plain: string, hashed: string) {
    return await bcrypt.compare(plain, hashed);
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

  async remove(id: number, authUser: AuthPayload): Promise<User> {
    if (id == authUser.id) {
      throw new BadRequestException('Cannot delele current user.');
    }

    const user = await this.userRepository.findOneOrFail({
      where: {
        id,
      },
    });

    await this.userRepository.remove(user);

    return user;
  }

  async resetPassword(resetPassword: ResetPasswordDTO): Promise<ResponseDTO> {
    const isExistedUser = await this.userRepository.findOne({
      where: {
        email: resetPassword.username ? resetPassword.username.toLocaleLowerCase() : undefined,
      },
    });
    if (!isExistedUser) {
      return {
        data: undefined,
        msgSts: {
          code: ERROR_CODE.NOT_FOUND,
          message: 'Username is existed',
        },
      };
    }

    isExistedUser.password = await this.hashPassword(resetPassword.newPassword);
    isExistedUser.resetToken = '';
    isExistedUser.retryNumber = 0;
    isExistedUser.blockAt = null;
    isExistedUser.expiredIn = dayjs().add(60, 'day').toDate();
    const user = await this.userRepository.save(isExistedUser);
    // delete user.password;

    return {
      data: user,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Reset password success',
      },
    };
  }
}
