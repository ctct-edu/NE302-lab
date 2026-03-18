/**
 * 入出庫の種別
 */
export enum TransactionType {
  /** 入庫 */
  IN = 'IN',
  /** 出庫 */
  OUT = 'OUT',
}

/**
 * 入出庫履歴
 */
export interface Transaction {
  /** 履歴ID（自動採番） */
  id: number;
  /** 商品ID */
  productId: number;
  /** 入庫 or 出庫 */
  type: TransactionType;
  /** 数量 */
  quantity: number;
  /** 備考 */
  note?: string;
  /** 登録日時 */
  createdAt: Date;
}

/**
 * 入出庫登録時の入力
 */
export interface TransactionInput {
  /** 商品ID */
  productId: number;
  /** 入庫 or 出庫 */
  type: TransactionType;
  /** 数量 */
  quantity: number;
  /** 備考 */
  note?: string;
}
