import {
  IProductService,
  IProductUseCase,
} from './product';
import {
  IOrderService,
  IOrderUseCase,
} from './order';


import { Container as infraContainer } from './infrastructure';

export type Container = {
  productUseCase: IProductUseCase;
  orderUseCase: IOrderUseCase;
};

export type ContainerConfig = {
  productRepository: infraContainer['productRepository'];
  orderRepository: infraContainer['orderRepository'];
};

export type ServiceContext = {
  productRepository: ContainerConfig['productRepository'];
  orderRepository: ContainerConfig['orderRepository'];
};

export type UseCaseContext = {
  productService: IProductService;
  orderService: IOrderService;
};
