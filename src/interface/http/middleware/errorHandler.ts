import R from 'ramda';
import httpStatusCodes from 'http-status-codes';

import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from '../../../util/http';

import { HttpRequest, HttpResponse, HttpNext } from '../../../types/interface';

export const errorHandler = (
  err: any,
  req: HttpRequest,
  res: HttpResponse,
  next: HttpNext,
) => {
  let status = httpStatusCodes.INTERNAL_SERVER_ERROR;
  let throwErr = err;

  if (err instanceof NotFoundError) {
    status = httpStatusCodes.NOT_FOUND;
    throwErr = new NotFoundError(throwErr.message);
  }

  if (err instanceof BadRequestError) {
    status = httpStatusCodes.BAD_REQUEST;
    throwErr = new BadRequestError(throwErr.message, throwErr.details);
  }

  if (status === httpStatusCodes.INTERNAL_SERVER_ERROR) {
    throwErr = new InternalServerError(err.message);
  }

  return res
    .status(status)
    .send(R.reject(R.isNil, {
      code: throwErr.code,
      message: throwErr.message,
      details: throwErr.details,
    }));
};
