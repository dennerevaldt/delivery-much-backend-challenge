import R from 'ramda';
import { Chance } from 'chance';

import { OrderUseCase } from '../order';
import { OrderService } from '../../service/order';

import { UseCaseContext } from '../../../types/core';
import { CreateNewOrderError, FindOrderError } from '../../../types/error/order';
import { ProductService } from '../../service/product';
import { Product } from '../../../types/product';
import { Order } from '../../../types/order';
import { AppError } from '../../../types/error';

const chance = new Chance();

describe('Order Use Case', () => {
  describe('#constructor', () => {
    it("doesn't constructs with undefined UseCaseContext", () => {
      expect(() => new OrderUseCase(
        (undefined as unknown) as UseCaseContext,
      )).toThrow("Cannot read property 'orderService' of undefined");
    });

    it('constructs with an empty UseCaseContext object', () => {
      const uc = new OrderUseCase({} as UseCaseContext);
      expect(uc).toBeInstanceOf(OrderUseCase);
      expect(uc).toHaveProperty('findOrder');
      expect(uc).toHaveProperty('createNewOrder');
    });
  });

  describe('#findOrder', () => {
    it('should find an order with correct values', async () => {
      const ctx = ({
        orderService: ({
          findOrder: jest.fn().mockResolvedValue([{
            id: chance.integer(),
          }]),
        } as unknown) as OrderService,
      } as unknown) as UseCaseContext;

      const uc = new OrderUseCase(ctx);

      const params = {
        id: chance.integer(),
      };

      await uc.findOrder(params);

      expect(ctx.orderService.findOrder).toHaveBeenCalledTimes(1);
      expect(ctx.orderService.findOrder).toHaveBeenCalledWith(
        params,
      );
    });

    it('throw error if is not found order', async () => {
      const ctx = ({
        orderService: ({
          findOrder: jest.fn().mockResolvedValue([]),
        } as unknown) as OrderService,
      } as unknown) as UseCaseContext;

      const uc = new OrderUseCase(ctx);

      const params = {
        id: chance.integer(),
      };

      await expect(uc.findOrder(params)).rejects.toBeInstanceOf(FindOrderError.OrderNotFound);
    });

    it('throw an error in findOrder', async () => {
      const ctx = ({
        orderService: ({
          findOrder: jest.fn(() => {
            throw AppError.UnexpectedError.create('Failed');
          }),
        } as unknown) as OrderService,
      } as unknown) as UseCaseContext;

      const uc = new OrderUseCase(ctx);

      const params = {
        id: chance.integer(),
      };

      await expect(uc.findOrder(params)).rejects.toBeInstanceOf(AppError.UnexpectedError);
    });
  });

  describe('#createNewOrder', () => {
    it('should create a new order with success', async () => {
      const products = [
        {
          name: chance.string(),
          quantity: chance.integer({ min: 1, max: 10 }),
          price: chance.floating({ min: 1, max: 10 })
        },
        {
          name: chance.string(),
          quantity: chance.integer({ min: 1, max: 10 }),
          price: chance.floating({ min: 1, max: 10 })
        },
      ] as Product[];

      const order = {
        products,
      } as Order;

      const ctx = ({
        productService: ({
          checkIsAvailableProducts: jest.fn().mockResolvedValue(products),
          updateProductInStock: jest.fn(),
        } as unknown) as ProductService,
        orderService: ({
          createNewOrder: jest.fn().mockResolvedValue(R.assoc('id', chance.integer(), order)),
        } as unknown) as OrderService,
      } as unknown) as UseCaseContext;

      const uc = new OrderUseCase(ctx);

      const createdOrder = await uc.createNewOrder(order);

      expect(createdOrder).toHaveProperty('id');
      expect(ctx.productService.checkIsAvailableProducts).toHaveBeenCalledTimes(1);
      expect(ctx.productService.updateProductInStock).toHaveBeenCalledTimes(2);
      expect(ctx.orderService.createNewOrder).toHaveBeenCalledTimes(1);
    });

    it('throw error if is not available some product', async () => {
      const products = [
        {
          name: chance.string(),
          quantity: chance.integer({ min: 1, max: 10 }),
          price: chance.floating({ min: 1, max: 10 })
        },
        {
          name: chance.string(),
          quantity: chance.integer({ min: 1, max: 10 }),
          price: chance.floating({ min: 1, max: 10 })
        },
      ] as Product[];

      const order = {
        id: chance.integer({ min: 1, max: 20 }),
        products,
        total: chance.floating({ min: 1, max: 20 }),
      } as Order;

      const ctx = ({
        productService: ({
          checkIsAvailableProducts: jest.fn().mockResolvedValue([products[0]]),
          updateProductInStock: jest.fn(),
        } as unknown) as ProductService,
        orderService: ({
          createNewOrder: jest.fn(),
        } as unknown) as OrderService,
      } as unknown) as UseCaseContext;

      const uc = new OrderUseCase(ctx);

      await expect(uc.createNewOrder(order)).rejects.toBeInstanceOf(CreateNewOrderError.SomeProductAreNotAvailable);
      expect(ctx.productService.checkIsAvailableProducts).toHaveBeenCalledTimes(1);
      expect(ctx.productService.updateProductInStock).not.toHaveBeenCalled();
      expect(ctx.orderService.createNewOrder).not.toHaveBeenCalled();
    });

    it('throw an error in createNewOrder', async () => {
      const products = [
        {
          name: chance.string(),
          quantity: chance.integer({ min: 1, max: 10 }),
          price: chance.floating({ min: 1, max: 10 })
        },
      ] as Product[];

      const order = {
        id: chance.integer({ min: 1, max: 20 }),
        products,
        total: chance.floating({ min: 1, max: 20 }),
      } as Order;

      const ctx = ({
        productService: ({
          checkIsAvailableProducts: jest.fn(() => {
            throw AppError.UnexpectedError.create('Failed');
          }),
          updateProductInStock: jest.fn(),
        } as unknown) as ProductService,
        orderService: ({
          createNewOrder: jest.fn(),
        } as unknown) as OrderService,
      } as unknown) as UseCaseContext;

      const uc = new OrderUseCase(ctx);

      await expect(uc.createNewOrder(order)).rejects.toBeInstanceOf(AppError.UnexpectedError);
    });
  });
});
