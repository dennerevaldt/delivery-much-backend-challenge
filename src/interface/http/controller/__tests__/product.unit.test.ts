import Chance from 'chance';
import httpStatus from 'http-status-codes';
import { Request } from 'jest-express/lib/request';
import { Response } from 'jest-express/lib/response';

import { ProductController } from '../product';

import { Container } from '../../../../types/core';
import { HttpControllerConfig } from '../../../../types/interface';
import { FindProductError } from '../../../../types/error/product';
import { AppError } from '../../../../types/error';

const chance = new Chance();

describe('Product Controller', () => {
  describe('#constructor', () => {
    it('should construct with correct context', async () => {
      const coreContainer = {
        productUseCase: {
          findProductByName: jest.fn(),
        },
      } as unknown as Container;
      const validator = jest.fn();

      const controller = new ProductController({ coreContainer, validator });

      expect(controller).toBeDefined();
      expect(controller.findProductByName).toBeInstanceOf(Function);
    });

    it('should explodes with empty context', async () => {
      expect(() => {
        // @ts-ignore
        new ProductController(); // eslint-disable-line no-new
      }).toThrow('Cannot destructure property');
    });
  });

  describe('#findProductByName', () => {
    it('should return an product by name', async () => {
      const req = new Request();
      const res = new Response();
      const next = jest.fn();

      const coreContainer = {
        productUseCase: {
          findProduct: jest.fn().mockResolvedValue({
            name: chance.string(),
            quantity: chance.integer({ min: 1 }),
            price: chance.floating({ min: 1 }),
          }),
        },
      } as unknown as Container;

      const params = {
        name: chance.string(),
      };

      req.setParams(params);

      const productController = new ProductController({ coreContainer } as HttpControllerConfig);

      // @ts-ignore
      await productController.findProductByName(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(httpStatus.OK);
      expect(res.send).toHaveBeenCalled();
      expect(coreContainer.productUseCase.findProduct).toHaveBeenCalledWith(params);
    });

    it('should call next function if not found product', async () => {
      const req = new Request();
      const res = new Response();
      const next = jest.fn();

      const coreContainer = {
        productUseCase: {
          findProduct: jest.fn(() => {
            throw FindProductError.ProductNotFound.create('Not found');
          }),
        },
      } as unknown as Container;

      const params = {
        name: chance.string(),
      };

      req.setParams(params);

      const productController = new ProductController({ coreContainer } as HttpControllerConfig);

      // @ts-ignore
      await productController.findProductByName(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(coreContainer.productUseCase.findProduct).toHaveBeenCalledWith(params);
    });

    it('should call next function in unexpected error', async () => {
      const req = new Request();
      const res = new Response();
      const next = jest.fn();

      const coreContainer = {
        productUseCase: {
          findProduct: jest.fn(() => {
            throw AppError.UnexpectedError.create('Failed');
          }),
        },
      } as unknown as Container;

      const params = {
        name: chance.string(),
      };

      req.setParams(params);

      const productController = new ProductController({ coreContainer } as HttpControllerConfig);

      // @ts-ignore
      await productController.findProductByName(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.send).not.toHaveBeenCalled();
      expect(coreContainer.productUseCase.findProduct).toHaveBeenCalledWith(params);
    });
  });
});
