import { Chance } from 'chance';

import { OrderService } from '../order';

import { ServiceContext } from '../../../types/core';
import { Order } from '../../../types/order';
import { Product } from '../../../types/product';
import { AppError } from '../../../types/error';

const chance = new Chance();

describe('Order Service', () => {
  describe('#constructor', () => {
    it("doesn't construct without a ServiceContext object", () => {
      expect(() => new OrderService(
        (undefined as unknown) as ServiceContext,
      )).toThrow("Cannot read property 'orderRepository' of undefined");
    });

    it('constructs with an empty object', () => {
      const svc = new OrderService({} as ServiceContext);
      expect(svc).toBeDefined();
      expect(svc).toBeInstanceOf(OrderService);
      expect(svc).toHaveProperty('orderRepository', undefined);
    });
  });

  describe('#findOrder', () => {
    it('should return an order by filter', async () => {
      const order = {
        id: chance.integer({ min: 1, max: 20 }),
      } as Order;

      const fakeRepo = {
        findOrder: jest.fn().mockResolvedValue([order]),
      };

      const svc = new OrderService(({
        orderRepository: fakeRepo,
      } as unknown) as ServiceContext);

      const result = await svc.findOrder(order);

      expect(fakeRepo.findOrder).toHaveBeenCalledTimes(1);
      expect(fakeRepo.findOrder).toHaveBeenCalledWith({ where: order });
    });

    it('should return empty list when not found', async () => {
      const order = {
        id: chance.integer({ min: 1, max: 20 }),
      } as Order;

      const fakeRepo = {
        findOrder: jest.fn().mockResolvedValue([]),
      };

      const svc = new OrderService(({
        orderRepository: fakeRepo,
      } as unknown) as ServiceContext);

      const result = await svc.findOrder(order);

      expect(result).toEqual([]);
      expect(fakeRepo.findOrder).toHaveBeenCalledTimes(1);
      expect(fakeRepo.findOrder).toHaveBeenCalledWith({ where: order });
    });

    it('throw an error in findOrder', async () => {
      const fakeRepo = {
        findOrder: jest.fn(() => {
          throw AppError.UnexpectedError.create('Failed');
        }),
      };

      const svc = new OrderService(({
        orderRepository: fakeRepo,
      } as unknown) as ServiceContext);

      const params = { id: chance.integer() } as Order;

      expect(() => svc.findOrder(params)).toThrowError(AppError.UnexpectedError);
    });
  });

  describe('#createNewOrder', () => {
    it('should create an order with success', async () => {
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

      const fakeRepo = {
        createNewOrder: jest.fn().mockResolvedValue([order]),
      };

      const svc = new OrderService(({
        orderRepository: fakeRepo,
      } as unknown) as ServiceContext);

      const result = await svc.createNewOrder(order);

      expect(result).toBeDefined();
      expect(fakeRepo.createNewOrder).toHaveBeenCalledTimes(1);
      expect(fakeRepo.createNewOrder).toHaveBeenCalledWith(order);
    });
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

    const fakeRepo = {
      createNewOrder: jest.fn(() => {
        throw AppError.UnexpectedError.create('Failed');
      }),
    };

    const svc = new OrderService(({
      orderRepository: fakeRepo,
    } as unknown) as ServiceContext);

    expect(() => svc.createNewOrder(order)).toThrowError(AppError.UnexpectedError);
  });
});
