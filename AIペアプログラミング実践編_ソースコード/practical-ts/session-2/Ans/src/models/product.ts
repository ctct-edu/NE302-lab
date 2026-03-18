/**
 * 商品カテゴリ
 */
export enum ProductCategory {
  /** 文房具 */
  STATIONERY = 'STATIONERY',
  /** オフィス用品 */
  OFFICE = 'OFFICE',
  /** その他 */
  OTHER = 'OTHER',
}

/**
 * 商品マスタ
 */
export interface Product {
  /** 商品ID（自動採番） */
  id: number
  /** 商品名 */
  name: string
  /** カテゴリ */
  category: ProductCategory
  /** 単価（税抜） */
  price: number
  /** 作成日時 */
  createdAt: Date
  /** 更新日時 */
  updatedAt: Date
}

/**
 * 商品登録時の入力
 */
export interface ProductInput {
  /** 商品名 */
  name: string
  /** カテゴリ */
  category: ProductCategory
  /** 単価（税抜） */
  price: number
}

/**
 * 商品更新時の入力（部分更新可能）
 */
export interface ProductUpdateInput {
  /** 商品名 */
  name?: string
  /** カテゴリ */
  category?: ProductCategory
  /** 単価（税抜） */
  price?: number
}
