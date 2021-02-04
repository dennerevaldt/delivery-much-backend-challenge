import httpStatus from 'http-status-codes';

import { findProductByNameSchema } from '../schema/product';
import Logger from '../../../util/logger';

import {
  IHttpRoute,
  HttpControllerConfig,
  HttpRouter,
  HttpRequest,
  HttpResponse,
  HttpNext,
} from '../../../types/interface';
import { FindProductError } from '../../../types/error/product';
import { NotFoundError } from '../../../util/http';

export class ProductController implements IHttpRoute {
  private validator: HttpControllerConfig['validator'];
  private productUseCase: HttpControllerConfig['coreContainer']['productUseCase'];

  constructor({ validator, coreContainer }: HttpControllerConfig) {
    this.validator = validator;
    this.productUseCase = coreContainer.productUseCase;
  }

  register(router: HttpRouter) {
    router.route('/products/:name')
      .get(
        this.validator(findProductByNameSchema),
        this.findProductByName.bind(this),
      );

    Logger.debug({
      class: 'ProductController',
      classType: 'HttpController',
    });
  }

  async findProductByName(req: HttpRequest, res: HttpResponse, next: HttpNext) {
    try {
      const { name } = req.params;

      const product = await this.productUseCase.findProduct({ name });

      return res.status(httpStatus.OK).send(product);
    } catch (error) {
      if (error.constructor === FindProductError.ProductNotFound) {
        return next(new NotFoundError(error.getValue().message));
      }

      return next(error);
    }
  }
}
