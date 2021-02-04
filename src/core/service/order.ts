import R from 'ramda';

import { ServiceContext } from '../../types/core';
import { IOrderService, Order } from '../../types/order';

export class OrderService implements IOrderService {
  private orderRepository: ServiceContext['orderRepository'];

  constructor(ctx: ServiceContext) {
    this.orderRepository = ctx.orderRepository;
  }

  findOrder(params: Partial<Order>): Promise<Order[]> {
    return this.orderRepository.findOrder({
      where: params,
    });
  }

  createNewOrder(order: Order): Promise<Order> {
    const total = R.reduce(
      R.add,
      0,
      R.map(
        (product) => product.price * product.quantity,
        order.products,
      ),
    );

    order.total = Math.round(total * 100) / 100;

    return this.orderRepository.createNewOrder(order);
  }
}
