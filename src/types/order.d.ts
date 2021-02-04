import { Product } from './product';

export type Order = {
  id: number;
  products: Product[];
  total: number;
};

export type FindOrderFilter = {
  where: Partial<Order>;
};

export interface IOrderRepository {
  /**
   * Find order by filter
   * @param params
   */
  findOrder(params: FindOrderFilter): Promise<Order[]>;

  /**
   * Create a new order
   * @param order
   */
  createNewOrder(order: Order): Promise<Order>;
}

export interface IOrderService {
  /**
   * Find order by filter
   * @param params
   */
  findOrder(params: Partial<Order>): Promise<Order[]>;

  /**
   * Create a new order
   * @param order
   */
  createNewOrder(order: Order): Promise<Order>;
}

export interface IOrderUseCase {
  /**
   * Find order by filter
   * @param params
   */
  findOrder(params: Partial<Order>): Promise<Order[]>;

  /**
   * Create a new order
   * @param order
   */
  createNewOrder(order: Order): Promise<Order>;
}
