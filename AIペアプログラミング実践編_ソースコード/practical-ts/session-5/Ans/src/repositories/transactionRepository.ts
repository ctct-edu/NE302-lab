import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import type { Transaction, TransactionInput, TransactionType } from '../models'
import { pool } from '../utils/database'

/**
 * 入出庫履歴リポジトリ
 * transactionsテーブルへのデータアクセスを担当
 */
export class TransactionRepository {
  /**
   * 入出庫履歴を新規登録
   */
  async create(input: TransactionInput): Promise<Transaction> {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO transactions (product_id, type, quantity, note) VALUES (?, ?, ?, ?)',
      [input.productId, input.type, input.quantity, input.note || null],
    )

    const transaction = await this.findById(result.insertId)
    if (!transaction) {
      throw new Error('Failed to retrieve created transaction')
    }
    return transaction
  }

  /**
   * IDで入出庫履歴を取得
   */
  async findById(id: number): Promise<Transaction | null> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM transactions WHERE id = ?', [id])
    if (rows.length === 0) {
      return null
    }
    return this.rowToTransaction(rows[0])
  }

  /**
   * 商品IDで入出庫履歴を取得
   */
  async findByProductId(productId: number): Promise<Transaction[]> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM transactions WHERE product_id = ? ORDER BY created_at DESC',
      [productId],
    )
    return rows.map(this.rowToTransaction)
  }

  /**
   * 全入出庫履歴を取得
   */
  async findAll(): Promise<Transaction[]> {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM transactions ORDER BY created_at DESC')
    return rows.map(this.rowToTransaction)
  }

  /**
   * DBの行データをTransactionオブジェクトに変換
   */
  private rowToTransaction(row: RowDataPacket): Transaction {
    return {
      id: row.id,
      productId: row.product_id,
      type: row.type as TransactionType,
      quantity: row.quantity,
      note: row.note || undefined,
      createdAt: new Date(row.created_at),
    }
  }
}
