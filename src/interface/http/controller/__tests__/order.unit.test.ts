import Chance from 'chance';
import httpStatus from 'http-status-codes';
import { Request } from 'jest-express/lib/request';
import { Response } from 'jest-express/lib/response';

import { OrderController } from '../order';

import { Container } from '../../../../types/core';
import { HttpControllerConfig } from '../../../../types/interface';
import { CreateNewOrderError, FindOrderError } from '../../../../types/error/order';
import { AppError } from '../../../../types/error';

const chance = new Chance();

describe('Order Controller', () => {
  describe('#constructor', () => {
    it('should construct with correct context', async () => {
      const coreContainer = {
        transactionUseCase: {
          createNewOrder: jest.fn(),
          listOrders: jest.fn(),
        },
      } as unknown as Container;
      const validator = jest.fn();

      const controller = new OrderController({ coreContainer, validator });

      expect(controller).toBeDefined();
      expect(controller.createNewOrder).toBeInstanceOf(Function);
      expect(controller.listOrders).toBeInstanceOf(Function);

    });

    it('should explodes with empty context', async () => {
      expect(() => {
        // @ts-ignore
        new OrderController(); // eslint-disable-line no-new
      }).toThrow('Cannot destructure property');
    });
  });

  describe('#createNewOrder', () => {
    it('should create a new order with success', async () => {
      const req = new Request();
      const res = new Response();
      const next = jest.fn();

      const products = [{
        name: chance.string(),
        quantity: chance.integer({ min: 1 }),
      }];

      const coreContainer = {
        orderUseCase: {
          createNewOrder: jest.fn().mockResolvedValue({
            id: chance.integer(),
            products,
            total: chance.floating({ min: 1 }),
          }),
        },
      } as unknown as Container;

      const order = {
        products,
      };

      req.setBody(order);

      const orderController = new OrderController({ coreContainer } as HttpControllerConfig);

      // @ts-ignore
      await orderController.createNewOrder(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalled();
      expect(coreContainer.orderUseCase.createNewOrder).toHaveBeenCalledWith(order);
    });

    it('should call next function if some product is not available', async () => {
      const req = new Request();
      const res = new Response();
      const next = jest.fn();

      const products = [{
        name: chance.string(),
        quantity: chance.integer({ min: 1 }),
      }];

      const coreContainer = {
        orderUseCase: {
          createNewOrder: jest.fn(() => {
            throw CreateNewOrderError.SomeProductAreNotAvailable.create();
          }),
        },
      } as unknown as Container;

      const order = {
        products,
      };

      req.setBody(order);

      const orderController = new OrderController({ coreContainer } as HttpControllerConfig);

      // @ts-ignore
      await orderController.createNewOrder(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(coreContainer.orderUseCase.createNewOrder).toHaveBeenCalledWith(order);
    });

    it('should call next function in unexpected error', async () => {
      const req = new Request();
      const res = new Response();
      const next = jest.fn();

      const products = [{
        name: chance.string(),
        quantity: chance.integer({ min: 1 }),
      }];

      const coreContainer = {
        orderUseCase: {
          createNewOrder: jest.fn(() => {
            throw AppError.UnexpectedError.create('Failed');
          }),
        },
      } as unknown as Container;

      const order = {
        products,
      };

      req.setBody(order);

      const orderController = new OrderController({ coreContainer } as HttpControllerConfig);

      // @ts-ignore
      await orderController.createNewOrder(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(coreContainer.orderUseCase.createNewOrder).toHaveBeenCalledWith(order);
    });
  });

  describe('#listOrders', () => {
    it('should return a list of orders with success', async () => {
      const req = new Request();
      const res = new Response();
      const next = jest.fn();

      const products = [{
        name: chance.string(),
        quantity: chance.integer({ min: 1 }),
      }];

      const order = {
        id: chance.integer(),
        products,
        total: chance.floating({ min: 1 }),
      };

      const coreContainer = {
        orderUseCase: {
          createNewOrder: jest.fn(),
          findOrder: jest.fn().mockResolvedValue([order]),
        },
      } as unknown as Container;

      const orderController = new OrderController({ coreContainer } as HttpControllerConfig);

      // @ts-ignore
      await orderController.listOrders(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalled();
      expect(coreContainer.orderUseCase.findOrder).toHaveBeenCalledWith({});
    });

    it('should return a order with success', async () => {
      const req = new Request();
      const res = new Response();
      const next = jest.fn();

      const products = [{
        name: chance.string(),
        quantity: chance.integer({ min: 1 }),
      }];

      const order = {
        id: chance.integer({ min: 1 }),
        products,
        total: chance.floating({ min: 1 }),
      };

      const coreContainer = {
        orderUseCase: {
          createNewOrder: jest.fn(),
          findOrder: jest.fn().mockResolvedValue([order]),
        },
      } as unknown as Container;

      const params = { id: order.id.toString() };

      req.setParams(params);

      const orderController = new OrderController({ coreContainer } as HttpControllerConfig);

      // @ts-ignore
      await orderController.listOrders(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalled();
      expect(coreContainer.orderUseCase.findOrder).toHaveBeenCalledWith({
        id: order.id,
      });
    });

    it('should call next function if not found order', async () => {
      const req = new Request();
      const res = new Response();
      const next = jest.fn();

      const products = [{
        name: chance.string(),
        quantity: chance.integer({ min: 1 }),
      }];

      const order = {
        id: chance.integer({ min: 1 }),
        products,
        total: chance.floating({ min: 1 }),
      };

      const coreContainer = {
        orderUseCase: {
          createNewOrder: jest.fn(),
          findOrder: jest.fn(() => {
            throw FindOrderError.OrderNotFound.create();
          }),
        },
      } as unknown as Container;

      const params = { id: order.id.toString() };

      req.setParams(params);

      const orderController = new OrderController({ coreContainer } as HttpControllerConfig);

      // @ts-ignore
      await orderController.listOrders(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(coreContainer.orderUseCase.findOrder).toHaveBeenCalledWith({
        id: order.id,
      });
    });

    it('should call next function in unexpected error', async () => {
      const req = new Request();
      const res = new Response();
      const next = jest.fn();

      const products = [{
        name: chance.string(),
        quantity: chance.integer({ min: 1 }),
      }];

      const order = {
        id: chance.integer({ min: 1 }),
        products,
        total: chance.floating({ min: 1 }),
      };

      const coreContainer = {
        orderUseCase: {
          createNewOrder: jest.fn(),
          findOrder: jest.fn(() => {
            throw AppError.UnexpectedError.create('Failed');
          }),
        },
      } as unknown as Container;

      const params = { id: order.id.toString() };

      req.setParams(params);

      const orderController = new OrderController({ coreContainer } as HttpControllerConfig);

      // @ts-ignore
      await orderController.listOrders(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(coreContainer.orderUseCase.findOrder).toHaveBeenCalledWith({
        id: order.id,
      });
    });
  });
});
