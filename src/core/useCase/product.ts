
import { UseCaseContext } from '../../types/core';
import { FindProductError } from '../../types/error/product';
import {
  IProductUseCase,
  Product,
  StockEventType,
} from '../../types/product';

export class ProductUseCase implements IProductUseCase {
  private productService: UseCaseContext['productService'];

  constructor(ctx: UseCaseContext) {
    this.productService = ctx.productService;
  }

  async findProduct(params: Pick<Product, 'name'>): Promise<Product> {
    const product = await this.productService.findProduct(params);

    if (!product) {
      throw FindProductError.ProductNotFound.create(params.name);
    }

    return product;
  }

  incrementProductInStock(product: Product): void {
    this.productService.updateProductInStock({
      product,
      event: StockEventType.INCREMENT,
    });
  }

  decrementProductInStock(product: Product): void {
    this.productService.updateProductInStock({
      product,
      event: StockEventType.DECREMENT,
    });
  }
}
