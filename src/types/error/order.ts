/* eslint-disable max-classes-per-file */

import { Result } from '../result';
import { DomainError } from './index';

export namespace FindOrderError {
  export class OrderNotFound extends Result<DomainError> {
    public constructor (id?: number) {
      super(false, {
        message: id ? `Order id '${id}' not found.` : `Orders not found.`
      })
    }

    public static create (id?: number): OrderNotFound {
      return new OrderNotFound(id);
    }
  }
}

export namespace CreateNewOrderError {
  export class SomeProductAreNotAvailable extends Result<DomainError> {
    public constructor () {
      super(false, {
        message: 'Some products are not available.'
      })
    }

    public static create (): SomeProductAreNotAvailable {
      return new SomeProductAreNotAvailable();
    }
  }
}
