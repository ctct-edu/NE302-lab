import { type OrderInput, ProductCategory, type ProductInput, type TransactionInput, TransactionType } from '../models'

/**
 * バリデーション結果
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * ProductInput のバリデーション
 */
export function validateProductInput(input: ProductInput): ValidationResult {
  const errors: string[] = []

  // name のバリデーション
  if (!input.name || input.name.trim().length === 0) {
    errors.push('商品名は必須です')
  } else if (input.name.trim().length > 100) {
    errors.push('商品名は100文字以内にしてください')
  }

  // category のバリデーション
  if (!Object.values(ProductCategory).includes(input.category)) {
    errors.push('カテゴリが不正です')
  }

  // price のバリデーション
  if (input.price === undefined || input.price === null) {
    errors.push('価格は必須です')
  } else if (!Number.isInteger(input.price)) {
    errors.push('価格は整数で指定してください')
  } else if (input.price < 0) {
    errors.push('価格は0以上にしてください')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * TransactionInput のバリデーション
 */
export function validateTransactionInput(input: TransactionInput): ValidationResult {
  const errors: string[] = []

  // productId のバリデーション
  if (!input.productId || input.productId <= 0) {
    errors.push('商品IDは必須です')
  }

  // type のバリデーション
  if (!Object.values(TransactionType).includes(input.type)) {
    errors.push('入出庫種別が不正です')
  }

  // quantity のバリデーション
  if (!input.quantity || input.quantity <= 0) {
    errors.push('数量は1以上で指定してください')
  } else if (!Number.isInteger(input.quantity)) {
    errors.push('数量は整数で指定してください')
  }

  // note のバリデーション
  if (input.note && input.note.length > 500) {
    errors.push('備考は500文字以内にしてください')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * OrderInput のバリデーション
 */
export function validateOrderInput(input: OrderInput): ValidationResult {
  const errors: string[] = []

  // productId のバリデーション
  if (!input.productId || input.productId <= 0) {
    errors.push('商品IDは必須です')
  }

  // quantity のバリデーション
  if (!input.quantity || input.quantity <= 0) {
    errors.push('発注数量は1以上で指定してください')
  } else if (!Number.isInteger(input.quantity)) {
    errors.push('発注数量は整数で指定してください')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
