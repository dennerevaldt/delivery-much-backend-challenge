import R from 'ramda';
import Chance from 'chance';

import { OrderRepository } from '../order';

import {
  ContainerConfig,
  IMysqlAdapter,
  IHttpAdapterConstructs,
} from '../../../types/infrastructure';
import { FindOrderFilter, Order } from '../../../types/order';
import { Product } from '../../../types/product';

const chance = new Chance();

describe('Order Repository', () => {
  describe('#constructor', () => {
    it('construct with all properties in context', () => {
      type Context = {
        config: ContainerConfig;
        mysqlAdapter: IMysqlAdapter;
        httpAdapter: IHttpAdapterConstructs;
      };

      const fakeMysql = {
        tableName: jest.fn(),
      };

      const ctx = {
        config: {},
        mysqlAdapter: fakeMysql,
        httpAdapter: jest.fn(),
      } as unknown as Context;

      const repo = new OrderRepository(ctx);

      expect(repo).toBeDefined();
    });

    it('explodes to construct without context', () => {
      type Context = {
        config: ContainerConfig;
        mysqlAdapter: IMysqlAdapter;
        httpAdapter: IHttpAdapterConstructs;
      };

      expect(() => {
        // eslint-disable-next-line no-new
        new OrderRepository({} as Context);
      })
      .toThrow("Cannot set property 'tableName' of undefined");
    });
  });

  describe('#findOrder', () => {
    it('should call where with id', async () => {
      const config = {};

      const order = {
        id: chance.integer({ min: 1 }),
      };

      const fakeMysql = {
        tableName: jest.fn(),
        db: {
          where: jest.fn().mockResolvedValue([order]),
        },
      };

      const ctx = {
        config,
        mysqlAdapter: fakeMysql,
      };

      // @ts-ignore
      const repo = new OrderRepository(ctx);

      const params = {
        where: { id: order.id },
      } as FindOrderFilter;

      const result = await repo.findOrder(params);

      expect(result).toEqual([order]);
      expect(fakeMysql.tableName).toEqual('orders');
      expect(fakeMysql.db.where).toHaveBeenCalledWith(params.where);
    });

    it('should return empty result with empty params', async () => {
      const config = {};

      const fakeMysql = {
        tableName: jest.fn(),
        db: {
          where: jest.fn().mockResolvedValue([]),
        },
      };

      const ctx = {
        config,
        mysqlAdapter: fakeMysql,
      };

      // @ts-ignore
      const repo = new OrderRepository(ctx);

      const params = {} as FindOrderFilter;

      const result = await repo.findOrder(params);

      expect(result).toEqual([]);
      expect(fakeMysql.tableName).toEqual('orders');
      expect(fakeMysql.db.where).toHaveBeenCalledWith(params.where);
    });

    it('throws an unexpected error', async () => {
      const config = {};

      const order = {
        id: chance.integer({ min: 1 }),
      };

      const fakeMysql = {
        tableName: jest.fn(),
        db: {
          where: jest.fn(() => {
            throw new Error('Some error');
          }),
        },
      };

      const ctx = {
        config,
        mysqlAdapter: fakeMysql,
      };

      // @ts-ignore
      const repo = new OrderRepository(ctx);

      const params = {
        where: { id: order.id },
      } as FindOrderFilter;

      expect(() => repo.findOrder(params)).rejects.toEqual(
        expect.objectContaining({ isFailure: true }),
      );
      expect(fakeMysql.tableName).toEqual('orders');
      expect(fakeMysql.db.where).toHaveBeenCalled();
    });
  });

  describe('#createNewOrder', () => {
    it('should call insert with all properties', async () => {
      const config = {};

      const id = chance.integer({ min: 1, max: 100 });

      const order = {
        products: [{
          name: chance.string(),
          quantity: chance.integer({ min:1 }),
          price: chance.floating({ min: 0, max: 100 }),
        }] as Product[],
        total: chance.floating({ min: 0, max: 100 }),
      } as Order;

      const fakeMysql = {
        tableName: jest.fn(),
        db: {
          insert: jest.fn().mockResolvedValue([id]),
        },
      };

      const ctx = {
        config,
        mysqlAdapter: fakeMysql,
      };

      // @ts-ignore
      const repo = new OrderRepository(ctx);

      const result = await repo.createNewOrder(order);

      expect(result).toEqual(R.assoc('id', id, order));
      expect(fakeMysql.tableName).toEqual('orders');
      expect(fakeMysql.db.insert).toHaveBeenCalledWith({
        ...order,
        products: JSON.stringify(order.products),
      });
    });

    it('throws an unexpected error', async () => {
      const config = {};

      const order = {
        products: [{
          name: chance.string(),
          quantity: chance.integer({ min:1 }),
          price: chance.floating({ min: 0, max: 100 }),
        }] as Product[],
        total: chance.floating({ min: 0, max: 100 }),
      } as Order;

      const fakeMysql = {
        tableName: jest.fn(),
        db: {
          insert: jest.fn(() => {
            throw new Error('Some error');
          }),
        },
      };

      const ctx = {
        config,
        mysqlAdapter: fakeMysql,
      };

      // @ts-ignore
      const repo = new OrderRepository(ctx);


      expect(() => repo.createNewOrder(order)).rejects.toEqual(
        expect.objectContaining({ isFailure: true }),
      );
      expect(fakeMysql.tableName).toEqual('orders');
      expect(fakeMysql.db.insert).toHaveBeenCalled();
    });
  });
});
