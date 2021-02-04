import R from 'ramda';

import { AppError } from '../../types/error';
import { ContainerConfig, IMysqlAdapter } from '../../types/infrastructure';
import { FindOrderFilter, IOrderRepository, Order } from '../../types/order';

type Context = {
  config: ContainerConfig;
  mysqlAdapter: IMysqlAdapter;
};

export class OrderRepository implements IOrderRepository {
  private mysqlAdapter: IMysqlAdapter;

  constructor({
    mysqlAdapter,
  }: Context) {
    this.mysqlAdapter = mysqlAdapter;
    this.mysqlAdapter.tableName = 'orders';
  }

  private toDatabase = R.evolve({
    products: JSON.stringify,
  });

  private fromDatabase = R.evolve({
    total: Number,
  });

  async findOrder(params: FindOrderFilter): Promise<Order[]> {
    try {
      const orders = await this.mysqlAdapter.db.where(params.where);

      return R.map(this.fromDatabase, orders) as Order[];
    } catch (error) {
      throw AppError.UnexpectedError.create(error);
    }
  }

  async createNewOrder(order: Order): Promise<Order> {
    try {
      const [id] = await this.mysqlAdapter.db
        .insert(this.toDatabase(order));

      return R.assoc('id', id, order);
    } catch (error) {
      throw AppError.UnexpectedError.create(error);
    }
  }
}
