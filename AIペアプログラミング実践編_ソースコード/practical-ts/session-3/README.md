# Session 3: テストコード実装

## 前提

- Session 2 でクラス設計・データベース設計が完成していること
- `exercise/` フォルダを作業フォルダにコピーしていること

---

## この演習で使う AI 機能

この演習では、以下の AI 機能を使い分けます。

| 機能           | 用途                                   | 操作                                                                                 |
| -------------- | -------------------------------------- | ------------------------------------------------------------------------------------ |
| チャット       | テストケースの洗い出し、設計相談       | GitHub Copilot: `Ctrl + Shift + I` / Cursor: `Ctrl + L`                              |
| インライン補完 | テストコード・実装コードの入力         | Tab で受け入れ、Esc で拒否                                                           |

---

## exercise フォルダの内容

`exercise/` フォルダには、Session 2 までの完成物が含まれています：

| ファイル/フォルダ      | 内容                                            |
| ---------------------- | ----------------------------------------------- |
| `docs/requirements.md` | 要件定義書（Session 1 で作成）                  |
| `docs/design.md`       | 設計書（Session 1 で作成）                      |
| `src/models/*.ts`      | 型定義ファイル（Session 2 で作成）              |
| `tests/sample.test.ts` | サンプルテストファイル                          |
| `package.json`         | プロジェクト設定（Vitest 設定済み）             |
| `tsconfig.json`        | TypeScript 設定                                 |

---

## 演習 1: テスト環境の確認（10 分）

この演習では、テスト環境が正しく動作することを確認します。

### ステップ 1: 依存パッケージをインストールする

ターミナルで以下のコマンドを実行します。

```sh
cd inventory-system
npm install
```

### ステップ 2: テストを実行する

```sh
npm test
```

サンプルテストが通ることを確認します。

- `npm test` は `package.json` の `scripts.test` に定義されたコマンドを実行
- Vitest は変更を検知して自動で再実行する（ウォッチモード）
- `q` キーで終了できる

### ステップ 3: テストファイルの構造を確認する

`tests/` フォルダ内のサンプルテストを開いて構造を確認します。

```typescript
// tests/sample.test.ts
import { describe, it, expect } from 'vitest';

describe('サンプルテスト', () => {
  it('1 + 1 は 2 になる', () => {
    expect(1 + 1).toBe(2);
  });
});
```

| 関数       | 説明                                     |
| ---------- | ---------------------------------------- |
| `describe` | テストをグループ化する（テストスイート） |
| `it`       | 個別のテストケース                       |
| `expect`   | 検証を行う（アサーション）               |
| `toBe`     | 値が等しいことを確認するマッチャー       |

---

## 演習 2: バリデーション関数のテスト（30 分）

この演習では、TDD（テスト駆動開発）の Red-Green-Refactor サイクルを体験します。

### TDD の Red-Green-Refactor サイクル

TDD では、以下の 3 つのステップを繰り返して開発を進めます：

| ステップ     | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| **Red**      | まず失敗するテストを書く（テストが赤くなる）           |
| **Green**    | テストが通る最小限の実装を書く（テストが緑になる）     |
| **Refactor** | コードを整理する（テストが緑のまま）                   |

この演習では、ステップ 1-2 で Red、ステップ 4 で Green を体験します。

### ステップ 1: 仕様からテストを生成する

使用する AI 機能: **Chat**

チャットパネルを開き、以下のプロンプトを入力します。

**入力するプロンプト：**

```
以下の仕様を満たすバリデーション関数のテストを Vitest で作成してください。
実装はまだないので、テストだけ書いてください。

【関数名】
validateProductInput

【仕様】
・name は必須、1〜100 文字
・category は STATIONERY, OFFICE, OTHER のいずれか
・price は 0 以上の整数

【テストケース】
・正常系：有効な入力
・異常系：name が空、name が 100 文字超、price が負数 など
```

### ステップ 2: テストファイルを作成する

使用する AI 機能: **インライン補完**

`tests/services/validation.test.ts` を作成します。

```sh
mkdir -p tests/services
```

期待されるテストコード：

```typescript
// tests/services/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateProductInput } from '../../src/services/validation';

describe('validateProductInput', () => {
  it('有効な入力の場合、バリデーションが成功する', () => {
    // Arrange（準備）
    const input = {
      name: 'ボールペン',
      category: 'STATIONERY' as const,
      price: 120,
    };

    // Act（実行）
    const result = validateProductInput(input);

    // Assert（検証）
    expect(result.isValid).toBe(true);
  });

  it('name が空の場合、エラーを返す', () => {
    const input = {
      name: '',
      category: 'STATIONERY' as const,
      price: 120,
    };

    const result = validateProductInput(input);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('商品名は必須です');
  });

  it('name が 100 文字を超える場合、エラーを返す', () => {
    const input = {
      name: 'a'.repeat(101),
      category: 'STATIONERY' as const,
      price: 120,
    };

    const result = validateProductInput(input);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('商品名は100文字以内で入力してください');
  });

  it('price が負数の場合、エラーを返す', () => {
    const input = {
      name: 'ボールペン',
      category: 'STATIONERY' as const,
      price: -100,
    };

    const result = validateProductInput(input);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('価格は0以上で入力してください');
  });
});
```

- **AAA パターン**: Arrange（準備）→ Act（実行）→ Assert（検証）
- **as const**: TypeScript でリテラル型として扱う

### ステップ 3: テストを実行する（Red）

```sh
npm test
```

実装がないので失敗することを確認します。「テストが失敗する」ことを確認してから実装に進みます。

### ステップ 4: 実装を作成する（Green）

使用する AI 機能: **Chat** または **インライン補完**

`src/services/validation.ts` を作成して、テストが通るように実装します。まずは「テストが通る最小限の実装」を目指します。

---

## 演習 3: Service 層のテスト（40 分）

この演習では、Repository をモックして Service のロジックだけをテストします。

### ステップ 1: モックの作成を学ぶ

**モック**とは「本物の代わりに使う偽物」です。データベースにアクセスせずに Service のロジックをテストできます。

モックの基本的な使い方：

```typescript
import { vi } from 'vitest';

// 関数をモック
const mockFn = vi.fn().mockReturnValue('result');

// Promise を返すモック
const mockAsync = vi.fn().mockResolvedValue({ id: 1 });

// 呼び出し回数の確認
expect(mockFn).toHaveBeenCalledTimes(1);

// 引数の確認
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
```

### ステップ 2: ProductService のテストを作成する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
ProductService のテストを書いてください。
ProductRepository はモックを使います。

【テスト対象】
ProductService.create(input)

【モックの設定】
・mockRepository.save() は保存した Product を返す
```

期待されるテストコード：

```typescript
// tests/services/productService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductService } from '../../src/services/productService';

describe('ProductService', () => {
  let mockRepository: any;
  let service: ProductService;

  beforeEach(() => {
    // 各テストの前にモックをリセット
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    };
    service = new ProductService(mockRepository);
  });

  describe('create', () => {
    it('商品を登録できる', async () => {
      // Arrange: モックの戻り値を設定
      const savedProduct = {
        id: 1,
        name: 'ボールペン',
        category: 'STATIONERY',
        price: 120,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.save.mockResolvedValue(savedProduct);

      // Act
      const product = await service.create({
        name: 'ボールペン',
        category: 'STATIONERY',
        price: 120,
      });

      // Assert
      expect(product.id).toBe(1);
      expect(product.name).toBe('ボールペン');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('バリデーションエラーの場合、例外を投げる', async () => {
      // Arrange
      const invalidInput = {
        name: '', // 空の商品名
        category: 'STATIONERY' as const,
        price: 120,
      };

      // Act & Assert
      await expect(service.create(invalidInput)).rejects.toThrow('商品名は必須です');
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
```

- **beforeEach**: 各テストの前に実行される処理（モックのリセットなど）
- **mockResolvedValue**: Promise を返すモックの戻り値を設定
- **rejects.toThrow**: 例外が投げられることを検証

### ステップ 3: テストを実行する

```sh
npm test
```

テストが通ることを確認します。

---

## 演習 4: 在庫更新ロジックなど、残りの機能のテスト（40 分）

この演習では、在庫更新（入庫・出庫）のテストを作成します。

### ステップ 1: エッジケースを洗い出す

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
在庫更新（入庫・出庫）のテストケースを洗い出してください。

【仕様】
・入庫: 在庫数を増やす
・出庫: 在庫数を減らす
・在庫数がマイナスになる場合はエラー

【特に確認したい】
・境界値（在庫 0 からの出庫など）
・異常系（存在しない商品の更新など）
```

期待される出力：

```
【正常系】
・入庫: 在庫 10 → 入庫 5 → 在庫 15
・出庫: 在庫 10 → 出庫 5 → 在庫 5

【境界値】
・在庫 0 から入庫 → 成功
・在庫 5 から出庫 5 → 在庫 0（成功）
・在庫 5 から出庫 6 → エラー（マイナスになる）

【異常系】
・存在しない商品 ID の更新 → エラー
・数量が 0 以下 → エラー
```

### ステップ 2: テストを作成して実行する

使用する AI 機能: **インライン補完**

洗い出したテストケースを元にテストを作成します。

```typescript
// tests/services/inventoryService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InventoryService } from '../../src/services/inventoryService';

describe('InventoryService', () => {
  let mockRepository: any;
  let service: InventoryService;

  beforeEach(() => {
    mockRepository = {
      findByProductId: vi.fn(),
      update: vi.fn(),
    };
    service = new InventoryService(mockRepository);
  });

  describe('updateQuantity', () => {
    it('入庫で在庫数が増える', async () => {
      // Arrange
      mockRepository.findByProductId.mockResolvedValue({
        productId: 1,
        quantity: 10,
        threshold: 5,
      });
      mockRepository.update.mockResolvedValue({
        productId: 1,
        quantity: 15,
        threshold: 5,
      });

      // Act
      const result = await service.updateQuantity(1, 'IN', 5);

      // Assert
      expect(result.quantity).toBe(15);
    });

    it('出庫で在庫がマイナスになる場合、エラーを投げる', async () => {
      // Arrange
      mockRepository.findByProductId.mockResolvedValue({
        productId: 1,
        quantity: 5,
        threshold: 5,
      });

      // Act & Assert
      await expect(service.updateQuantity(1, 'OUT', 6)).rejects.toThrow('在庫が不足しています');
    });
  });
});
```

完成したら、`Ans/` フォルダの完成例と見比べて確認してください。
