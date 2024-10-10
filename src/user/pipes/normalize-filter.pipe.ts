import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { FilterUserDTO } from '../dto/user-filter.dto';

@Injectable()
export class NormalizeFilterPipe implements PipeTransform {
  transform(filter: FilterUserDTO) {
    const MAX_LIMIT_VALUE = 1000000;

    // Check and validate the 'limit' as a number
    if (filter.role !== undefined) {
      const parsedRole = +filter.role; // Convert to number
      if (
        isNaN(parsedRole) ||
        !Number.isInteger(parsedRole) ||
        parsedRole < 0 ||
        parsedRole > MAX_LIMIT_VALUE
      ) {
        throw new BadRequestException(
          'Invalid role. Role must be a positive number.',
        );
      }
      filter.role = parsedRole;
    }

    if (filter.sol !== undefined) {
      const parsedSol = +filter.sol; // Convert to number
      if (
        isNaN(parsedSol) ||
        !Number.isInteger(parsedSol) ||
        parsedSol < 0 ||
        parsedSol > MAX_LIMIT_VALUE
      ) {
        throw new BadRequestException(
          'Invalid sol. Sol must be a positive number.',
        );
      }
      filter.sol = parsedSol;
    }

    return filter;
  }
}
