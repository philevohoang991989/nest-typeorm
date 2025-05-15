/* eslint-disable @typescript-eslint/no-unsafe-assignment */

export enum ERROR_CODES {
  SUCCESS = 0,
  FAIL = 1,
  NOT_FOUND = 404,
  SERVER_ERROR = 500,
  // Thêm các mã khác nếu cần
}

export function successResponse(data: any, message = 'Success') {
  return {
    data,
    msgSts: {
      code: ERROR_CODES.SUCCESS,
      message,
    },
  };
}

export function errorResponse(message = 'Error', code = ERROR_CODES.FAIL) {
  return {
    data: null,
    msgSts: {
      code,
      message,
    },
  };
}
