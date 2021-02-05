import Chance from 'chance';

import { ProductRepository } from '../product';

import {
  ContainerConfig,
  IMysqlAdapter,
  IHttpAdapterConstructs,
} from '../../../types/infrastructure';
import { FindProductFilter, StockEventType } from '../../../types/product';

const chance = new Chance();

describe('Product Repository', () => {
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

      const repo = new ProductRepository(ctx);

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
        new ProductRepository({} as Context);
      })
      .toThrow("Cannot set property 'tableName' of undefined");
    });
  });

  describe('#checkIsAvailableProduct', () => {
    it('should call where with name and quantity', async () => {
      const config = {};

      const product = {
        id: chance.integer({ min: 1 }),
        name: chance.string(),
        quantity: chance.integer({ min:1 }),
        price: chance.floating({ min: 0, max: 100 }),
      };

      const fakeAndWhere = {
        andWhere: jest.fn().mockResolvedValue([product]),
      };

      const fakeMysql = {
        tableName: jest.fn(),
        db: {
          where: jest.fn(() => fakeAndWhere),
        },
      };

      const ctx = {
        config,
        mysqlAdapter: fakeMysql,
      };

      // @ts-ignore
      const repo = new ProductRepository(ctx);

      const params = {
        name: product.name,
        quantity: product.quantity,
      };

      const result = await repo.checkIsAvailableProduct(params);

      expect(result).toEqual(product);
      expect(fakeMysql.tableName).toEqual('products');
      expect(fakeMysql.db.where).toHaveBeenCalled();
      expect(fakeAndWhere.andWhere).toHaveBeenCalled();
    });

    it('throws an unexpected error', async () => {
      const config = {};

      const product = {
        id: chance.integer({ min: 1 }),
        name: chance.string(),
        quantity: chance.integer({ min:1 }),
        price: chance.floating({ min: 0, max: 100 }),
      };

      const fakeAndWhere = {
        andWhere: jest.fn(() => {
          throw new Error('Some error');
        }),
      };

      const fakeMysql = {
        tableName: jest.fn(),
        db: {
          where: jest.fn(() => fakeAndWhere),
        },
      };

      const ctx = {
        config,
        mysqlAdapter: fakeMysql,
      };

      // @ts-ignore
      const repo = new ProductRepository(ctx);

      const params = {
        name: product.name,
        quantity: product.quantity,
      };

      expect(() => repo.checkIsAvailableProduct(params)).rejects.toEqual(
        expect.objectContaining({ isFailure: true }),
      );
      expect(fakeMysql.tableName).toEqual('products');
      expect(fakeMysql.db.where).toHaveBeenCalled();
      expect(fakeAndWhere.andWhere).toHaveBeenCalled();
    });
  });

  describe('#findProduct', () => {
    it('should call where with name', async () => {
      const config = {};

      const product = {
        id: chance.integer({ min: 1 }),
        name: chance.string(),
        quantity: chance.integer({ min:1 }),
        price: chance.floating({ min: 0, max: 100 }),
      };

      const fakeMysql = {
        tableName: jest.fn(),
        db: {
          where: jest.fn().mockResolvedValue([product]),
        },
      };

      const ctx = {
        config,
        mysqlAdapter: fakeMysql,
      };

      // @ts-ignore
      const repo = new ProductRepository(ctx);

      const params = {
        where: { name: chance.string() },
      } as FindProductFilter;

      const result = await repo.findProduct(params);

      expect(result).toEqual(product);
      expect(fakeMysql.tableName).toEqual('products');
      expect(fakeMysql.db.where).toHaveBeenCalledWith(params.where);
    });

    it('throws an unexpected error', async () => {
      const config = {};

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
      const repo = new ProductRepository(ctx);

      const params = {
        where: { name: chance.string() },
      } as FindProductFilter;

      expect(() => repo.findProduct(params)).rejects.toEqual(
        expect.objectContaining({ isFailure: true }),
      );
      expect(fakeMysql.tableName).toEqual('products');
      expect(fakeMysql.db.where).toHaveBeenCalled();
    });
  });

  describe('#updateProductInStock', () => {
    it('should call update with params and INCREMENT type', async () => {
      const config = {};

      const product = {
        id: chance.integer({ min: 1 }),
        name: chance.string(),
        quantity: chance.integer({ min:1 }),
        price: chance.floating({ min: 0, max: 100 }),
      };

      const fakeThen = jest.fn();
      const fakeWhere = jest.fn(() => ({
        then: fakeThen,
      }));
      const fakeAndWhere = jest.fn(() => ({
        then: fakeThen,
      }));

      const fakeMysql = {
        tableName: jest.fn(),
        db: {
          increment: jest.fn(() => ({
            where: fakeWhere,
          })),
          decrement: jest.fn(() => ({
            where: jest.fn(() => ({
              andWhere: fakeAndWhere,
            })),
          })),
        },
      };

      const ctx = {
        config,
        mysqlAdapter: fakeMysql,
      };

      // @ts-ignore
      const repo = new ProductRepository(ctx);

      await repo.updateProductInStock({ product, event: StockEventType.INCREMENT });

      expect(fakeMysql.tableName).toEqual('products');
      expect(fakeMysql.db.increment).toHaveBeenCalled();
      expect(fakeMysql.db.decrement).not.toHaveBeenCalled();
      expect(fakeWhere).toHaveBeenCalled();
      expect(fakeThen).toHaveBeenCalled();
    });

    it('should call update with params and DECREMENT type', async () => {
      const config = {};

      const product = {
        id: chance.integer({ min: 1 }),
        name: chance.string(),
        quantity: chance.integer({ min:1 }),
        price: chance.floating({ min: 0, max: 100 }),
      };

      const fakeThen = jest.fn();
      const fakeWhere = jest.fn(() => ({
        then: fakeThen,
      }));
      const fakeAndWhere = jest.fn(() => ({
        then: fakeThen,
      }));

      const fakeMysql = {
        tableName: jest.fn(),
        db: {
          increment: jest.fn(() => ({
            where: fakeWhere,
          })),
          decrement: jest.fn(() => ({
            where: jest.fn(() => ({
              andWhere: fakeAndWhere,
            })),
          })),
        },
      };

      const ctx = {
        config,
        mysqlAdapter: fakeMysql,
      };

      // @ts-ignore
      const repo = new ProductRepository(ctx);

      await repo.updateProductInStock({ product, event: StockEventType.DECREMENT });

      expect(fakeMysql.tableName).toEqual('products');
      expect(fakeMysql.db.increment).not.toHaveBeenCalled();
      expect(fakeMysql.db.decrement).toHaveBeenCalled();
      expect(fakeAndWhere).toHaveBeenCalled();
      expect(fakeThen).toHaveBeenCalled();
    });

    it('throws an unexpected error', async () => {
      const config = {};

      const product = {
        id: chance.integer({ min: 1 }),
        name: chance.string(),
        quantity: chance.integer({ min:1 }),
        price: chance.floating({ min: 0, max: 100 }),
      };


      const fakeWhere = jest.fn(() => ({
        then: jest.fn(() => {
          throw new Error('Some error');
        }),
      }));

      const fakeMysql = {
        tableName: jest.fn(),
        db: {
          increment: jest.fn(() => ({
            where: fakeWhere,
          })),
        },
      };

      const ctx = {
        config,
        mysqlAdapter: fakeMysql,
      };

      // @ts-ignore
      const repo = new ProductRepository(ctx);

      expect(() => repo.updateProductInStock({ product, event: StockEventType.INCREMENT })).toThrow(expect.objectContaining({ isFailure: true }));
      expect(fakeMysql.tableName).toEqual('products');
      expect(fakeMysql.db.increment).toHaveBeenCalled();
    });
  });
});
