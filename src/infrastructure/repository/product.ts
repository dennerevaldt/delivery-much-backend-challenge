import R from 'ramda';

import { AppError } from '../../types/error';
import {
  ContainerConfig,
  IMysqlAdapter,
} from '../../types/infrastructure';
import {
  FindProductFilter,
  IProductRepository,
  Product,
  StockEventType,
} from '../../types/product';


type Context = {
  config: ContainerConfig;
  mysqlAdapter: IMysqlAdapter;
};

export class ProductRepository implements IProductRepository {
  private mysqlAdapter: IMysqlAdapter;

  constructor({
    mysqlAdapter,
  }: Context) {
    this.mysqlAdapter = mysqlAdapter;
    this.mysqlAdapter.tableName = 'products';
  }

  private fromDatabase = R.evolve({
    price: Number,
    quantity: Number,
  });

  async checkIsAvailableProduct(filter: Pick<Product, 'name' | 'quantity'>): Promise<Product> {
    try {
      const [product] = await this.mysqlAdapter.db
        .where('name', filter.name)
        .andWhere('quantity', '>=', filter.quantity);

      if (!product) {
        return null;
      }

      return this.fromDatabase(product) as Product;
    } catch (error) {
      throw AppError.UnexpectedError.create(error);
    }
  }


  async findProduct(filter: FindProductFilter): Promise<Product> {
    try {
      const [product] = await this.mysqlAdapter.db
        .where(filter.where);

      if (!product) {
        return null;
      }

      return this.fromDatabase(product) as Product;
    } catch (error) {
      throw AppError.UnexpectedError.create(error);
    }
  }

  updateProductInStock({ product, event }: { product: Product; event: StockEventType; }): void {
    try {
      if (event === StockEventType.INCREMENT) {
        this.mysqlAdapter.db
          .increment('quantity', product.quantity || 1)
          .where({
            name: product.name,
          })
          .then();
      }

      if (event === StockEventType.DECREMENT) {
        this.mysqlAdapter.db
          .decrement('quantity', product.quantity || 1)
          .where({
            name: product.name,
          })
          .andWhere('quantity', '>', 0)
          .then();
      }

    } catch (error) {
      throw AppError.UnexpectedError.create(error);
    }
  }
}
