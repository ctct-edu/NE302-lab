import type { Order, OrderInput, OrderStatus } from "../models"
import type { InventoryService } from "./inventoryService"
import { TransactionType } from "../models"

interface OrderRepository {
  save(input: OrderInput & { status: OrderStatus }): Promise<Order>
  findById(id: number): Promise<Order | null>
  findAll(): Promise<Order[]>
  update(id: number, input: { status: OrderStatus }): Promise<Order>
}

/**
 * 発注サービス
 * 発注に関するビジネスロジックを担当
 */
export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private inventoryService: InventoryService,
  ) {}

  /**
   * 発注を作成
   */
  async create(input: OrderInput): Promise<Order> {
    // バリデーション
    if (!input.items || input.items.length === 0) {
      throw new Error("発注明細が必要です")
    }

    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new Error("数量は1以上で指定してください")
      }
    }

    // 発注を保存（ステータスは PENDING）
    return this.orderRepository.save({
      ...input,
      status: "PENDING",
    })
  }

  /**
   * 発注を確定
   */
  async confirm(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findById(orderId)

    if (!order) {
      throw new Error("発注が見つかりません")
    }

    if (order.status !== "PENDING") {
      throw new Error("確定済みまたはキャンセル済みの発注は変更できません")
    }

    // 在庫を更新（入庫）
    for (const item of order.items) {
      await this.inventoryService.updateStock(
        item.productId,
        item.quantity,
        TransactionType.IN,
        `発注 #${orderId} 入荷`,
      )
    }

    // ステータスを更新
    return this.orderRepository.update(orderId, { status: "CONFIRMED" })
  }

  /**
   * 発注をキャンセル
   */
  async cancel(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findById(orderId)

    if (!order) {
      throw new Error("発注が見つかりません")
    }

    if (order.status !== "PENDING") {
      throw new Error("確定済みまたはキャンセル済みの発注は変更できません")
    }

    return this.orderRepository.update(orderId, { status: "CANCELLED" })
  }

  /**
   * 発注一覧を取得
   */
  async findAll(): Promise<Order[]> {
    return this.orderRepository.findAll()
  }

  /**
   * 発注詳細を取得
   */
  async findById(id: number): Promise<Order | null> {
    return this.orderRepository.findById(id)
  }
}
