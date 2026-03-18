import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import type { Product, ProductCategory, ProductInput, ProductUpdateInput } from '../models'
import { pool } from '../utils/database'

/**
 * 商品リポジトリ
 * productsテーブルへのデータアクセスを担当
 */
export class ProductRepository {
  /**
   * 全商品を取得
   */
  async findAll(): Promise<Product[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products ORDER BY id')
    return rows.map(this.rowToProduct)
  }

  /**
   * IDで商品を取得
   */
  async findById(id: number): Promise<Product | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE id = ?', [id])
    if (rows.length === 0) {
      return null
    }
    return this.rowToProduct(rows[0])
  }

  /**
   * 商品を新規登録
   */
  async save(input: ProductInput): Promise<Product> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO products (name, category, price) VALUES (?, ?, ?)',
      [input.name.trim(), input.category, input.price],
    )

    const product = await this.findById(result.insertId)
    if (!product) {
      throw new Error('Failed to retrieve created product')
    }
    return product
  }

  /**
   * 商品を更新
   */
  async update(id: number, input: ProductUpdateInput): Promise<Product> {
    const updates: string[] = []
    const values: (string | number)[] = []

    if (input.name !== undefined) {
      updates.push('name = ?')
      values.push(input.name.trim())
    }
    if (input.category !== undefined) {
      updates.push('category = ?')
      values.push(input.category)
    }
    if (input.price !== undefined) {
      updates.push('price = ?')
      values.push(input.price)
    }

    if (updates.length === 0) {
      const product = await this.findById(id)
      if (!product) {
        throw new Error('Product not found')
      }
      return product
    }

    values.push(id)
    await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values)

    const product = await this.findById(id)
    if (!product) {
      throw new Error('Product not found')
    }
    return product
  }

  /**
   * 商品を削除
   */
  async delete(id: number): Promise<void> {
    await pool.query('DELETE FROM products WHERE id = ?', [id])
  }

  /**
   * 商品名で検索（部分一致、大文字小文字区別なし）
   */
  async search(query: string): Promise<Product[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM products WHERE name LIKE ? ORDER BY id', [
      `%${query}%`,
    ])
    return rows.map(this.rowToProduct)
  }

  /**
   * DBの行データをProductオブジェクトに変換
   */
  private rowToProduct(row: RowDataPacket): Product {
    return {
      id: row.id,
      name: row.name,
      category: row.category as ProductCategory,
      price: row.price,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }
}
