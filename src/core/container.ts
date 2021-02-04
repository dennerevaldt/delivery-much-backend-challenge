import { ProductUseCase } from './useCase/product';

import { ProductService } from './service/product';
import { OrderService } from './service/order';

import { ContainerConfig, Container } from '../types/core';
import { OrderUseCase } from './useCase/order';

export function createContainer(config: ContainerConfig): Container {
  const serviceContext = {
    productRepository: config.productRepository,
    orderRepository: config.orderRepository,
  };

  const useCaseContext = {
    productService: new ProductService(serviceContext),
    orderService: new OrderService(serviceContext),
  };

  return {
    productUseCase: new ProductUseCase(useCaseContext),
    orderUseCase: new OrderUseCase(useCaseContext),
  };
}
