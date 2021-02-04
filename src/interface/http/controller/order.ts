import httpStatus from 'http-status-codes';
import R from 'ramda';

import { createOrdersSchema, listOrdersSchema } from '../schema/order';
import { BadRequestError, NotFoundError } from '../../../util/http';
import Logger from '../../../util/logger';

import {
  IHttpRoute,
  HttpControllerConfig,
  HttpRouter,
  HttpRequest,
  HttpResponse,
  HttpNext,
} from '../../../types/interface';
import { Order } from '../../../types/order';
import { CreateNewOrderError, FindOrderError } from '../../../types/error/order';

export class OrderController implements IHttpRoute {
  private validator: HttpControllerConfig['validator'];
  private orderUseCase: HttpControllerConfig['coreContainer']['orderUseCase'];

  constructor({ validator, coreContainer }: HttpControllerConfig) {
    this.validator = validator;
    this.orderUseCase = coreContainer.orderUseCase;
  }

  register(router: HttpRouter) {
    router.route('/orders')
      .post(
        this.validator(createOrdersSchema),
        this.createNewOrder.bind(this),
      )
      .get(
        this.validator(listOrdersSchema),
        this.listOrders.bind(this),
      );

    router.route('/orders/:id')
      .get(
        this.validator(listOrdersSchema),
        this.listOrders.bind(this),
      );

    Logger.debug({
      class: 'OrderController',
      classType: 'HttpController',
    });
  }

  async createNewOrder(req: HttpRequest, res: HttpResponse, next: HttpNext) {
    try {
      const { products } = req.body;

      const order = await this.orderUseCase.createNewOrder({ products } as Order);

      return res.status(httpStatus.OK).send(order);
    } catch (error) {
      if (error.constructor === CreateNewOrderError.SomeProductAreNotAvailable) {
        return next(new BadRequestError(error.getValue().message));
      }

      return next(error);
    }
  }

  async listOrders(req: HttpRequest, res: HttpResponse, next: HttpNext) {
    try {
      const { id } = req.params;
      const order = {} as Order;

      if (id) order.id = parseInt(id, 10);

      const orders = await this.orderUseCase.findOrder(order);

      const result = id && !R.isEmpty(orders)
        ? orders[0]
        : orders;

      return res.status(httpStatus.OK).send(result);
    } catch (error) {
      if (error.constructor === FindOrderError.OrderNotFound) {
        return next(new NotFoundError(error.getValue().message));
      }

      return next(error);
    }
  }
}
