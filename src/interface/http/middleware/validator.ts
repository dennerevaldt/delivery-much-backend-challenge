import { AnySchema } from 'joi';
import { curryN } from 'ramda';

import { BadRequestError } from '../../../util/http'
import Logger from '../../../util/logger';

import { HttpRequest, HttpResponse, HttpNext } from '../../../types/interface';

export const validator = curryN(
  4,
  (schema: AnySchema, req: HttpRequest, res: HttpResponse, next: HttpNext) => {
    const validation = schema.validate(req, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: true,
    });

    if (validation.error) {
      Logger.error({
        class: 'Validator',
        classType: 'HttpMiddleware',
        details: validation.error.details,
      });
      return next(new BadRequestError('Invalid request params.', validation.error.details));
    }

    Object.assign(req, validation.value);

    return next();
  },
);
