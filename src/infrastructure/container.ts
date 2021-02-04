import { OrderRepository } from './repository/order';
import { ProductRepository } from './repository/product';

import { MysqlAdapter } from './adapter/mysql';
// import { HttpAdapter } from './adapter/http';
// import { MessageBusAdapter } from './adapter/messageBus';

import {
  ContainerConfig,
  Container,
} from '../types/infrastructure';

export function createContainer(config: ContainerConfig): Container {
  return {
    productRepository: new ProductRepository({
      config,
      mysqlAdapter: new MysqlAdapter(),
    }),
    orderRepository: new OrderRepository({
      config,
      mysqlAdapter: new MysqlAdapter(),
    }),
  };
}
