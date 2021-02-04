import { Result } from '../result';
import { DomainError } from './index';

export namespace FindProductError {
  export class ProductNotFound extends Result<DomainError> {
    public constructor (productName: string) {
      super(false, {
        message: `Product '${productName}' not found.`
      })
    }

    public static create (productName: string): ProductNotFound {
      return new ProductNotFound(productName);
    }
  }
}
