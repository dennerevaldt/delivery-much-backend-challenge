import { Chance } from 'chance';

import { ProductService } from '../product';

import { ServiceContext } from '../../../types/core';
import { Product, StockEventType } from '../../../types/product';
import { AppError } from '../../../types/error';

const chance = new Chance();

describe('Product Service', () => {
  describe('#constructor', () => {
    it("doesn't construct without a ServiceContext object", () => {
      expect(() => new ProductService(
        (undefined as unknown) as ServiceContext,
      )).toThrow("Cannot read property 'productRepository' of undefined");
    });

    it('constructs with an empty object', () => {
      const svc = new ProductService({} as ServiceContext);
      expect(svc).toBeDefined();
      expect(svc).toBeInstanceOf(ProductService);
      expect(svc).toHaveProperty('productRepository', undefined);
    });
  });

  describe('#checkIsAvailableProducts', () => {
    it('should call repository.checkIsAvailableProduct with valid params', async () => {
      const fakeRepo = {
        checkIsAvailableProduct: jest.fn(),
      };

      const svc = new ProductService(({
        productRepository: fakeRepo,
      } as unknown) as ServiceContext);

      const products = [
        { name: chance.string(), quantity: chance.integer({ min: 1 })},
        { name: chance.string(), quantity: chance.integer({ min: 1 })},
      ] as Product[];

      await svc.checkIsAvailableProducts(products);

      expect(fakeRepo.checkIsAvailableProduct).toHaveBeenCalledTimes(2);
    });

    it('should return a list of available products with all items', async () => {
      const products = [
        { name: chance.string(), quantity: chance.integer({ min: 1 }), price: chance.floating({ min: 1 }) },
        { name: chance.string(), quantity: chance.integer({ min: 1 }), price: chance.floating({ min: 1 }) },
      ] as Product[];

      const fakeRepo = {
        checkIsAvailableProduct: jest.fn()
          .mockResolvedValueOnce(products[0])
          .mockResolvedValue(products[1]),
      };

      const svc = new ProductService(({
        productRepository: fakeRepo,
      } as unknown) as ServiceContext);

      const result = await svc.checkIsAvailableProducts(products);

      expect(result).toEqual(products);
      expect(result).toHaveLength(2);
    });

    it('should return a list of available products with only one item', async () => {
      const products = [
        { name: chance.string(), quantity: chance.integer({ min: 1 }), price: chance.floating({ min: 1 }) },
        { name: chance.string(), quantity: chance.integer({ min: 1 }), price: chance.floating({ min: 1 }) },
      ] as Product[];

      const fakeRepo = {
        checkIsAvailableProduct: jest.fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValue(products[1]),
      };

      const svc = new ProductService(({
        productRepository: fakeRepo,
      } as unknown) as ServiceContext);

      const result = await svc.checkIsAvailableProducts(products);

      expect(result).toEqual([products[1]]);
      expect(result).toHaveLength(1);
    });

    it('throw an error in checkIsAvailableProducts', async () => {
      const products = [
        { name: chance.string(), quantity: chance.integer({ min: 1 }), price: chance.floating({ min: 1 }) },
      ] as Product[];

      const fakeRepo = {
        checkIsAvailableProduct: jest.fn(() => {
          throw AppError.UnexpectedError.create('Failed');
        }),
      };

      const svc = new ProductService(({
        productRepository: fakeRepo,
      } as unknown) as ServiceContext);

      await expect(svc.checkIsAvailableProducts(products)).rejects.toBeInstanceOf(AppError.UnexpectedError);
    });
  });

  describe('#findProduct', () => {
    it('should return a product by name', async () => {
      const products = [
        { name: chance.string(), quantity: chance.integer({ min: 1 }), price: chance.floating({ min: 1 }) },
      ] as Product[];

      const fakeRepo = {
        findProduct: jest.fn().mockResolvedValue(products),
      };

      const svc = new ProductService(({
        productRepository: fakeRepo,
      } as unknown) as ServiceContext);

      const params = { name: products[0].name };

      await svc.findProduct(params);

      expect(fakeRepo.findProduct).toHaveBeenCalledTimes(1);
      expect(fakeRepo.findProduct).toHaveBeenCalledWith({ where: params });
    });

    it('should return undefined when not found product', async () => {
      const products = [
        { name: chance.string() },
      ] as Product[];

      const fakeRepo = {
        findProduct: jest.fn().mockResolvedValue(undefined),
      };

      const svc = new ProductService(({
        productRepository: fakeRepo,
      } as unknown) as ServiceContext);

      const params = { name: products[0].name };

      const result = await svc.findProduct(params);

      expect(result).toBeUndefined();
      expect(fakeRepo.findProduct).toHaveBeenCalledTimes(1);
      expect(fakeRepo.findProduct).toHaveBeenCalledWith({ where: params });
    });

    it('should return undefined when not found product', async () => {
      const products = [
        { name: chance.string() },
      ] as Product[];

      const fakeRepo = {
        findProduct: jest.fn().mockResolvedValue(undefined),
      };

      const svc = new ProductService(({
        productRepository: fakeRepo,
      } as unknown) as ServiceContext);

      const params = { name: products[0].name };

      const result = await svc.findProduct(params);

      expect(result).toBeUndefined();
      expect(fakeRepo.findProduct).toHaveBeenCalledTimes(1);
      expect(fakeRepo.findProduct).toHaveBeenCalledWith({ where: params });
    });

    it('throw an error in findProduct', async () => {
      const fakeRepo = {
        findProduct: jest.fn(() => {
          throw AppError.UnexpectedError.create('Failed');
        }),
      };

      const svc = new ProductService(({
        productRepository: fakeRepo,
      } as unknown) as ServiceContext);

      const params = { name: chance.string() };

      expect(() => svc.findProduct(params)).toThrowError(AppError.UnexpectedError);
    });
  });

  describe('#updateProductInStock', () => {
    it.each(Object.values(StockEventType))('should update stock with %s event type', async (eventType) => {
      const product = {
        name: chance.string(),
        quantity: chance.integer({ min: 1 }),
        price: chance.floating({ min: 1 }),
      } as Product;

      const fakeRepo = {
        updateProductInStock: jest.fn(),
      };

      const svc = new ProductService(({
        productRepository: fakeRepo,
      } as unknown) as ServiceContext);

      const params = { product, event: eventType as StockEventType };

      await svc.updateProductInStock(params);

      expect(fakeRepo.updateProductInStock).toHaveBeenCalledTimes(1);
      expect(fakeRepo.updateProductInStock).toHaveBeenCalledWith(params);
    });

    it('throw an error in updateProductInStock', async () => {
      const product = {
        name: chance.string(),
        quantity: chance.integer({ min: 1 }),
        price: chance.floating({ min: 1 }),
      } as Product;

      const fakeRepo = {
        updateProductInStock: jest.fn(() => {
          throw AppError.UnexpectedError.create('Failed');
        }),
      };

      const svc = new ProductService(({
        productRepository: fakeRepo,
      } as unknown) as ServiceContext);

      const params = { product, event: StockEventType.INCREMENT };

      expect(() => svc.updateProductInStock(params)).toThrowError(AppError.UnexpectedError);
    });
  });
});
