/**
 * 在庫情報
 */
export interface InventoryItem {
  /** 商品ID（Productとの関連） */
  productId: number;
  /** 現在の在庫数 */
  quantity: number;
  /** 発注閾値（この数を下回るとアラート） */
  threshold: number;
  /** 最終更新日時 */
  updatedAt: Date;
}

/**
 * 在庫登録時の入力
 */
export interface InventoryItemInput {
  /** 商品ID */
  productId: number;
  /** 初期在庫数 */
  quantity: number;
  /** 発注閾値 */
  threshold: number;
}

/**
 * 在庫更新時の入力（部分更新可能）
 */
export interface InventoryItemUpdateInput {
  /** 在庫数 */
  quantity?: number;
  /** 発注閾値 */
  threshold?: number;
}

/**
 * 在庫アラート情報（商品情報付き）
 */
export interface InventoryAlertItem {
  /** 商品ID */
  productId: number;
  /** 商品名 */
  productName: string;
  /** 現在の在庫数 */
  quantity: number;
  /** 発注閾値 */
  threshold: number;
}
