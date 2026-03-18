/**
 * 発注ステータス
 */
export enum OrderStatus {
  /** 作成中 */
  PENDING = 'PENDING',
  /** 発注済み */
  ORDERED = 'ORDERED',
  /** 入荷済み */
  RECEIVED = 'RECEIVED',
  /** キャンセル */
  CANCELLED = 'CANCELLED',
}

/**
 * 発注情報
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
  /** 発注日 */
  orderedAt?: Date
  /** 入荷日 */
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

/**
 * 発注更新時の入力（部分更新可能）
 */
export interface OrderUpdateInput {
  /** 発注数量 */
  quantity?: number
  /** ステータス */
  status?: OrderStatus
}
