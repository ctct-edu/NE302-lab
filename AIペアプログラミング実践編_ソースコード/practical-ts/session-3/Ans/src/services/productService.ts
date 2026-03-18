import type { Product, ProductInput, ProductUpdateInput } from '../models';
import { validateProductInput } from './validation';

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  save(input: ProductInput): Promise<Product>;
  update(id: number, input: ProductUpdateInput): Promise<Product>;
  delete(id: number): Promise<void>;
  search(keyword: string): Promise<Product[]>;
}

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async create(input: ProductInput): Promise<Product> {
    const result = validateProductInput(input);
    if (!result.isValid) {
      // テストはメッセージ文字列一致で検証しているため先頭のエラーを投げる
      throw new Error(result.errors[0] ?? '入力が不正です');
    }
    return await this.repository.save(input);
  }

  async findAll(): Promise<Product[]> {
    return await this.repository.findAll();
  }

  async findById(id: number): Promise<Product | null> {
    return await this.repository.findById(id);
  }

  async search(keyword: string): Promise<Product[]> {
    if (!keyword || keyword.trim().length === 0) {
      return await this.repository.findAll();
    }
    return await this.repository.search(keyword);
  }

  async update(id: number, input: ProductUpdateInput): Promise<Product> {
    // 部分更新でも name/price の基本制約だけは合わせておく
    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new Error('商品名は必須です');
    }
    if (input.price !== undefined) {
      if (!Number.isInteger(input.price)) {
        throw new Error('価格は整数で指定してください');
      }
      if (input.price < 0) {
        throw new Error('価格は0以上にしてください');
      }
    }
    return await this.repository.update(id, input);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }
}
