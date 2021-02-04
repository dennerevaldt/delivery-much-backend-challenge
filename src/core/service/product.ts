import R from 'ramda';

import { ServiceContext } from '../../types/core';
import {
  IProductService,
  Product,
  StockEventType,
} from '../../types/product';

export class ProductService implements IProductService {
  private productRepository: ServiceContext['productRepository'];

  constructor(ctx: ServiceContext) {
    this.productRepository = ctx.productRepository;
  }

  async checkIsAvailableProducts(products: Product[]): Promise<Product[]> {
    const promises = R.map(
      (product) => this.productRepository.checkIsAvailableProduct({
        name: product.name,
        quantity: product.quantity,
      }),
      products,
    );

    const productsAvailable = await Promise.all(promises);

    return R.reject(R.isNil, productsAvailable);
  }

  findProduct(params: Pick<Product, 'name'>): Promise<Product> {
    return this.productRepository.findProduct({
      where: {
        name: params.name,
      }
    });
  }

  updateProductInStock(params: { product: Product; event: StockEventType; }): void {
    this.productRepository.updateProductInStock(params);
  }
}
