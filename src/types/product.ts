export enum StockEventType {
  INCREMENT = 'INCREMENT',
  DECREMENT = 'DECREMENT',
};

export type Product = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export type FindProductFilter = {
  where: Partial<Product>;
};

export interface IProductRepository {
  /**
   * Find a product by filter
   * @param filter
   */
  findProduct(filter: FindProductFilter): Promise<Product>;

  /**
   * Check is available product
   * @param names
   */
  checkIsAvailableProduct(filter: Pick<Product, 'name' | 'quantity'>): Promise<Product>;

  /**
   * Update a product in stock with increment or decrement
   * @param params
   */
  updateProductInStock({
    product,
    event,
  }: {
    product: Product;
    event: StockEventType;
  }): void;
}

export interface IProductService {
  /**
   * Find a product by filter
   * @param params
   */
  findProduct(params: Pick<Product,'name'>): Promise<Product>;

  /**
   * Update a product in stock with increment or decrement
   * @param params
   */
  updateProductInStock({
    product,
    event,
  }: {
    product: Product;
    event: StockEventType;
  }): void;

  /**
   * Check is available products in stock
   * @param products
   */
  checkIsAvailableProducts(products: Product[]): Promise<Product[]>;
}

export interface IProductUseCase {
  /**
   * Find a product by filter
   * @param params
   */
  findProduct(params: Pick<Product,'name'>): Promise<Product>;

  /**
   * Increment a product in stock
   * @param product
   */
  incrementProductInStock(product: Product): void;

  /**
   * Decrement a product in stock
   * @param product
   */
  decrementProductInStock(product: Product): void;
}
