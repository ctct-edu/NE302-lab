import { type InventoryAlertItem, type InventoryItem, type TransactionInput, TransactionType } from '../models'
import type { InventoryRepository } from '../repositories/inventoryRepository'
import type { ProductRepository } from '../repositories/productRepository'
import type { TransactionRepository } from '../repositories/transactionRepository'

/**
 * 在庫サービス
 * 在庫に関するビジネスロジックを担当
 */
export class InventoryService {
  constructor(
    private inventoryRepository: InventoryRepository,
    private transactionRepository: TransactionRepository,
    private productRepository: ProductRepository,
  ) {}

  /**
   * 在庫を更新（入庫/出庫）
   */
  async updateStock(productId: number, quantity: number, type: TransactionType, note?: string): Promise<InventoryItem> {
    // バリデーション
    if (quantity <= 0) {
      throw new Error('数量は1以上で指定してください')
    }

    // 商品の存在確認
    const product = await this.productRepository.findById(productId)
    if (!product) {
      throw new Error('商品が見つかりません')
    }

    // 現在の在庫を取得
    let inventory = await this.inventoryRepository.findByProductId(productId)
    if (!inventory) {
      // 在庫レコードがない場合は作成
      inventory = await this.inventoryRepository.save({
        productId,
        quantity: 0,
        threshold: 10, // デフォルト閾値
      })
    }

    // 新しい在庫数を計算
    let newQuantity: number
    if (type === TransactionType.IN) {
      newQuantity = inventory.quantity + quantity
    } else {
      newQuantity = inventory.quantity - quantity
      if (newQuantity < 0) {
        throw new Error('在庫が不足しています')
      }
    }

    // 在庫を更新
    const updatedInventory = await this.inventoryRepository.update(productId, {
      quantity: newQuantity,
    })

    // 入出庫履歴を記録
    const transactionInput: TransactionInput = {
      productId,
      type,
      quantity,
      note,
    }
    await this.transactionRepository.create(transactionInput)

    return updatedInventory
  }

  /**
   * 商品IDで在庫を取得
   */
  async findByProductId(productId: number): Promise<InventoryItem | null> {
    return this.inventoryRepository.findByProductId(productId)
  }

  /**
   * 在庫アラート対象を取得
   */
  async getAlertItems(): Promise<InventoryAlertItem[]> {
    return this.inventoryRepository.findAlertItems()
  }

  /**
   * 閾値を更新
   */
  async updateThreshold(productId: number, threshold: number): Promise<InventoryItem> {
    if (threshold < 0) {
      throw new Error('閾値は0以上で指定してください')
    }

    const inventory = await this.inventoryRepository.findByProductId(productId)
    if (!inventory) {
      throw new Error('在庫情報が見つかりません')
    }

    return this.inventoryRepository.update(productId, { threshold })
  }
}
