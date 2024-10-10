import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindQueryDto } from 'src/shared/dto/find-query.dto';
import { ResponseDTO } from 'src/shared/dto/base.dto';
import { FilterUserDTO } from './dto/user-filter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Brackets, Repository } from 'typeorm';
import { getOrderByClause } from 'src/shared/helpers/query-sort.helper';
import { Pagination } from 'src/shared/dto/pagination.dto';
import { ERROR_CODE } from 'src/shared/constants/common.constant';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async pagination(
    filters: FilterUserDTO,
    query?: FindQueryDto,
  ): Promise<ResponseDTO> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role');

    if (filters.keyword) {
      qb.andWhere(
        new Brackets((sqb) => {
          sqb
            .where('user.name ILIKE :keyword', {
              keyword: `%${filters.keyword}%`,
            })
            .orWhere('user.username ILIKE :keyword');
        }),
      );
    }

    if (filters.role) {
      qb.andWhere('user.role = :role', { role: filters.role });
    }

    if (query.sort) {
      qb.orderBy(getOrderByClause(query.sort));
    } else {
      qb.orderBy('user.id', 'DESC');
    }

    const results = await qb
      .skip(+query.limit * (+query.page - 1))
      .take(+query.limit)
      .getManyAndCount();
    const payload = new Pagination(results);

    return {
      data: payload,
      msgSts: {
        code: ERROR_CODE.SUCCESS,
        message: 'Get user success',
      },
    };
  }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
