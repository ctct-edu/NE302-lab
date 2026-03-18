import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import type { InventoryAlertItem, InventoryItem, InventoryItemInput, InventoryItemUpdateInput } from '../models'
import { pool } from '../utils/database'

/**
 * 在庫リポジトリ
 * inventory_itemsテーブルへのデータアクセスを担当
 */
export class InventoryRepository {
  /**
   * 商品IDで在庫を取得
   */
  async findByProductId(productId: number): Promise<InventoryItem | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM inventory_items WHERE product_id = ?', [productId])
    if (rows.length === 0) {
      return null
    }
    return this.rowToInventoryItem(rows[0])
  }

  /**
   * 在庫を新規登録
   */
  async save(input: InventoryItemInput): Promise<InventoryItem> {
    await pool.query<ResultSetHeader>(
      'INSERT INTO inventory_items (product_id, quantity, threshold) VALUES (?, ?, ?)',
      [input.productId, input.quantity, input.threshold],
    )

    const item = await this.findByProductId(input.productId)
    if (!item) {
      throw new Error('Failed to retrieve created inventory item')
    }
    return item
  }

  /**
   * 在庫を更新
   */
  async update(productId: number, input: InventoryItemUpdateInput): Promise<InventoryItem> {
    const updates: string[] = []
    const values: number[] = []

    if (input.quantity !== undefined) {
      updates.push('quantity = ?')
      values.push(input.quantity)
    }
    if (input.threshold !== undefined) {
      updates.push('threshold = ?')
      values.push(input.threshold)
    }

    if (updates.length === 0) {
      const item = await this.findByProductId(productId)
      if (!item) {
        throw new Error('Inventory item not found')
      }
      return item
    }

    values.push(productId)
    await pool.query(`UPDATE inventory_items SET ${updates.join(', ')} WHERE product_id = ?`, values)

    const item = await this.findByProductId(productId)
    if (!item) {
      throw new Error('Inventory item not found')
    }
    return item
  }

  /**
   * 在庫アラート対象を取得（閾値以下の在庫）
   */
  async findAlertItems(): Promise<InventoryAlertItem[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
        i.product_id,
        p.name AS product_name,
        i.quantity,
        i.threshold
      FROM inventory_items i
      JOIN products p ON i.product_id = p.id
      WHERE i.quantity <= i.threshold
      ORDER BY i.quantity ASC`,
    )
    return rows.map((row) => ({
      productId: row.product_id,
      productName: row.product_name,
      quantity: row.quantity,
      threshold: row.threshold,
    }))
  }

  /**
   * DBの行データをInventoryItemオブジェクトに変換
   */
  private rowToInventoryItem(row: RowDataPacket): InventoryItem {
    return {
      productId: row.product_id,
      quantity: row.quantity,
      threshold: row.threshold,
      updatedAt: new Date(row.updated_at),
    }
  }
}
