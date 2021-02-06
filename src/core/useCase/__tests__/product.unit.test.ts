import { Chance } from 'chance';

import { ProductUseCase } from '../product';
import { ProductService } from '../../service/product';

import { UseCaseContext } from '../../../types/core';
import { FindProductError } from '../../../types/error/product';
import { AppError } from '../../../types/error';
import { Product, StockEventType } from '../../../types/product';

const chance = new Chance();

describe('Product Use Case', () => {
  describe('#constructor', () => {
    it("doesn't constructs with undefined UseCaseContext", () => {
      expect(() => new ProductUseCase(
        (undefined as unknown) as UseCaseContext,
      )).toThrow("Cannot read property 'productService' of undefined");
    });

    it('constructs with an empty UseCaseContext object', () => {
      const uc = new ProductUseCase({} as UseCaseContext);
      expect(uc).toBeInstanceOf(ProductUseCase);
      expect(uc).toHaveProperty('findProduct');
      expect(uc).toHaveProperty('incrementProductInStock');
      expect(uc).toHaveProperty('decrementProductInStock');
    });
  });

  describe('#findProduct', () => {
    it('should find a product by name with success', async () => {
      const ctx = ({
        productService: ({
          findProduct: jest.fn().mockResolvedValue({
            id: chance.integer(),
          }),
        } as unknown) as ProductService,
      } as unknown) as UseCaseContext;

      const uc = new ProductUseCase(ctx);

      const params = {
        name: chance.string(),
      };

      await uc.findProduct(params);

      expect(ctx.productService.findProduct).toHaveBeenCalledTimes(1);
      expect(ctx.productService.findProduct).toHaveBeenCalledWith(
        params,
      );
    });

    it('throw error if is not found product', async () => {
      const ctx = ({
        productService: ({
          findProduct: jest.fn().mockResolvedValue(undefined),
        } as unknown) as ProductService,
      } as unknown) as UseCaseContext;

      const uc = new ProductUseCase(ctx);

      const params = {
        name: chance.string(),
      };

      await expect(uc.findProduct(params)).rejects.toBeInstanceOf(FindProductError.ProductNotFound);
    });

    it('throw an error in findProduct', async () => {
      const ctx = ({
        productService: ({
          findProduct: jest.fn(() => {
            throw AppError.UnexpectedError.create('Failed');
          }),
        } as unknown) as ProductService,
      } as unknown) as UseCaseContext;

      const uc = new ProductUseCase(ctx);

      const params = {
        name: chance.string(),
      };

      await expect(uc.findProduct(params)).rejects.toBeInstanceOf(AppError.UnexpectedError);
    });
  });

  describe('#incrementProductInStock', () => {
    it('should to increment an product in stock', async () => {
      const ctx = ({
        productService: ({
          updateProductInStock: jest.fn(),
        } as unknown) as ProductService,
      } as unknown) as UseCaseContext;

      const uc = new ProductUseCase(ctx);

      const product = {
        name: chance.string(),
        quantity: chance.integer({ min: 1 }),
        price: chance.floating({ min: 1 }),
      } as Product;

      await uc.incrementProductInStock(product);

      expect(ctx.productService.updateProductInStock).toHaveBeenCalledWith({
        product,
        event: StockEventType.INCREMENT,
      });
    });
  });

  describe('#decrementProductInStock', () => {
    it('should to decrement an product in stock', async () => {
      const ctx = ({
        productService: ({
          updateProductInStock: jest.fn(),
        } as unknown) as ProductService,
      } as unknown) as UseCaseContext;

      const uc = new ProductUseCase(ctx);

      const product = {
        name: chance.string(),
        quantity: chance.integer({ min: 1 }),
        price: chance.floating({ min: 1 }),
      } as Product;

      await uc.decrementProductInStock(product);

      expect(ctx.productService.updateProductInStock).toHaveBeenCalledWith({
        product,
        event: StockEventType.DECREMENT,
      });
    });
  });
});
