import R from 'ramda';

import { UseCaseContext } from '../../types/core';
import { CreateNewOrderError, FindOrderError } from '../../types/error/order';
import {
  IOrderUseCase,
  Order,
} from '../../types/order';
import { StockEventType } from '../../types/product';

export class OrderUseCase implements IOrderUseCase {
  private orderService: UseCaseContext['orderService'];
  private productService: UseCaseContext['productService'];

  constructor(ctx: UseCaseContext) {
    this.orderService = ctx.orderService;
    this.productService = ctx.productService;
  }

  async findOrder(params: Partial<Order>): Promise<Order[]> {
    const order = await this.orderService.findOrder(params);

    if (!order || R.isEmpty(order)) {
      throw FindOrderError.OrderNotFound.create(params.id);
    }

    return order;
  }

  async createNewOrder(order: Order): Promise<Order> {
    const isAvailableProducts = await this.productService
      .checkIsAvailableProducts(order.products);

    if (R.isEmpty(isAvailableProducts) || isAvailableProducts.length < order.products.length) {
      throw CreateNewOrderError.SomeProductAreNotAvailable.create();
    }

    R.forEach(
      (product) => {
        const productWithPrice = R.find(
          (availableProduct) => availableProduct.name === product.name , isAvailableProducts,
        );

        product.price = productWithPrice.price;
      },
      order.products,
    );

    const newOrder = await this.orderService.createNewOrder(order);

    R.forEach((product) => {
      this.productService.updateProductInStock({
        product,
        event: StockEventType.DECREMENT,
      });
    }, order.products);

    return newOrder;
  }
}
