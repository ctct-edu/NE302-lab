/**
 * 発注ステータス
 * - PENDING: 発注中（まだ届いていない）
 * - ORDERED: 発注済み
 * - RECEIVED: 入荷済み（在庫に反映）
 * - CANCELLED: キャンセル済み
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  ORDERED = 'ORDERED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

/**
 * 発注情報
 * 1商品ごとに1発注を作成する
 */
export interface Order {
  /** 発注ID（自動採番） */
  id: number
  /** 商品ID */
  productId: number
  /** 発注数量 */
  quantity: number
  /** ステータス */
  status: OrderStatus
  /** 発注日時 */
  orderedAt?: Date
  /** 入荷日時 */
  receivedAt?: Date
  /** 作成日時 */
  createdAt: Date
}

/**
 * 発注作成時の入力
 */
export interface OrderInput {
  /** 商品ID */
  productId: number
  /** 発注数量 */
  quantity: number
}
