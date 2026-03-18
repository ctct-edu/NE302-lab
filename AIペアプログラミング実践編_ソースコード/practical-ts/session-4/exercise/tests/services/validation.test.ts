import { describe, expect, it } from 'vitest';
import { ProductCategory, TransactionType } from '../../src/models';
import {
  validateOrderInput,
  validateProductInput,
  validateTransactionInput,
} from '../../src/services/validation';

describe('validateProductInput', () => {
  describe('正常系', () => {
    it('有効な入力の場合、バリデーションが成功する', () => {
      // Arrange
      const input = {
        name: 'ボールペン',
        category: ProductCategory.STATIONERY,
        price: 120,
      };

      // Act
      const result = validateProductInput(input);

      // Assert
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('価格が0の場合、バリデーションが成功する', () => {
      const input = {
        name: 'サンプル品',
        category: ProductCategory.OTHER,
        price: 0,
      };

      const result = validateProductInput(input);

      expect(result.isValid).toBe(true);
    });
  });

  describe('name のバリデーション', () => {
    it('商品名が空の場合、エラーになる', () => {
      const input = {
        name: '',
        category: ProductCategory.STATIONERY,
        price: 100,
      };

      const result = validateProductInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('商品名は必須です');
    });

    it('商品名が空白のみの場合、エラーになる', () => {
      const input = {
        name: '   ',
        category: ProductCategory.STATIONERY,
        price: 100,
      };

      const result = validateProductInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('商品名は必須です');
    });

    it('商品名が100文字の場合、バリデーションが成功する', () => {
      const input = {
        name: 'あ'.repeat(100),
        category: ProductCategory.STATIONERY,
        price: 100,
      };

      const result = validateProductInput(input);

      expect(result.isValid).toBe(true);
    });

    it('商品名が101文字の場合、エラーになる', () => {
      const input = {
        name: 'あ'.repeat(101),
        category: ProductCategory.STATIONERY,
        price: 100,
      };

      const result = validateProductInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('商品名は100文字以内にしてください');
    });
  });

  describe('category のバリデーション', () => {
    it('不正なカテゴリの場合、エラーになる', () => {
      const input = {
        name: 'テスト商品',
        category: 'INVALID' as ProductCategory,
        price: 100,
      };

      const result = validateProductInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('カテゴリが不正です');
    });
  });

  describe('price のバリデーション', () => {
    it('価格が負の値の場合、エラーになる', () => {
      const input = {
        name: 'テスト商品',
        category: ProductCategory.STATIONERY,
        price: -1,
      };

      const result = validateProductInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('価格は0以上にしてください');
    });

    it('価格が小数の場合、エラーになる', () => {
      const input = {
        name: 'テスト商品',
        category: ProductCategory.STATIONERY,
        price: 99.5,
      };

      const result = validateProductInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('価格は整数で指定してください');
    });
  });

  describe('複数エラー', () => {
    it('複数の項目が不正な場合、すべてのエラーが返る', () => {
      const input = {
        name: '',
        category: 'INVALID' as ProductCategory,
        price: -1,
      };

      const result = validateProductInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe('validateTransactionInput', () => {
  describe('正常系', () => {
    it('有効な入庫入力の場合、バリデーションが成功する', () => {
      const input = {
        productId: 1,
        type: TransactionType.IN,
        quantity: 10,
      };

      const result = validateTransactionInput(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('備考付きの場合、バリデーションが成功する', () => {
      const input = {
        productId: 1,
        type: TransactionType.OUT,
        quantity: 5,
        note: '店舗A向け出庫',
      };

      const result = validateTransactionInput(input);

      expect(result.isValid).toBe(true);
    });
  });

  describe('quantity のバリデーション', () => {
    it('数量が0の場合、エラーになる', () => {
      const input = {
        productId: 1,
        type: TransactionType.IN,
        quantity: 0,
      };

      const result = validateTransactionInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('数量は1以上で指定してください');
    });

    it('数量が負の値の場合、エラーになる', () => {
      const input = {
        productId: 1,
        type: TransactionType.IN,
        quantity: -5,
      };

      const result = validateTransactionInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('数量は1以上で指定してください');
    });
  });

  describe('note のバリデーション', () => {
    it('備考が500文字の場合、バリデーションが成功する', () => {
      const input = {
        productId: 1,
        type: TransactionType.IN,
        quantity: 10,
        note: 'あ'.repeat(500),
      };

      const result = validateTransactionInput(input);

      expect(result.isValid).toBe(true);
    });

    it('備考が501文字の場合、エラーになる', () => {
      const input = {
        productId: 1,
        type: TransactionType.IN,
        quantity: 10,
        note: 'あ'.repeat(501),
      };

      const result = validateTransactionInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('備考は500文字以内にしてください');
    });
  });
});

describe('validateOrderInput', () => {
  describe('正常系', () => {
    it('有効な入力の場合、バリデーションが成功する', () => {
      const input = {
        productId: 1,
        quantity: 50,
      };

      const result = validateOrderInput(input);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('quantity のバリデーション', () => {
    it('数量が0の場合、エラーになる', () => {
      const input = {
        productId: 1,
        quantity: 0,
      };

      const result = validateOrderInput(input);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('発注数量は1以上で指定してください');
    });
  });
});
