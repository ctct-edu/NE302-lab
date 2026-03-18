import type { Product, ProductInput, ProductUpdateInput } from '../models'
import type { ProductRepository } from '../repositories/productRepository'
import { validateProductInput } from './validation'

/**
 * 商品サービス
 * 商品に関するビジネスロジックを担当
 */
export class ProductService {
  constructor(private repository: ProductRepository) {}

  /**
   * 商品を新規登録
   */
  async create(input: ProductInput): Promise<Product> {
    // バリデーション
    const validation = validateProductInput(input)
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '))
    }

    return this.repository.save(input)
  }

  /**
   * 全商品を取得
   */
  async findAll(): Promise<Product[]> {
    return this.repository.findAll()
  }

  /**
   * IDで商品を取得
   */
  async findById(id: number): Promise<Product | null> {
    return this.repository.findById(id)
  }

  /**
   * 商品を更新
   */
  async update(id: number, input: ProductUpdateInput): Promise<Product> {
    // 存在確認
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new Error('商品が見つかりません')
    }

    // 部分的なバリデーション
    if (input.name !== undefined) {
      if (input.name.trim().length === 0) {
        throw new Error('商品名は必須です')
      }
      if (input.name.trim().length > 100) {
        throw new Error('商品名は100文字以内にしてください')
      }
    }

    if (input.price !== undefined) {
      if (input.price < 0) {
        throw new Error('価格は0以上にしてください')
      }
      if (!Number.isInteger(input.price)) {
        throw new Error('価格は整数で指定してください')
      }
    }

    return this.repository.update(id, input)
  }

  /**
   * 商品を削除
   */
  async delete(id: number): Promise<void> {
    // 存在確認
    const existing = await this.repository.findById(id)
    if (!existing) {
      throw new Error('商品が見つかりません')
    }

    await this.repository.delete(id)
  }

  /**
   * 商品名で検索
   */
  async search(query: string): Promise<Product[]> {
    if (!query || query.trim().length === 0) {
      return this.repository.findAll()
    }
    return this.repository.search(query.trim())
  }
}
