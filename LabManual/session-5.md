# Session 5: 機能拡張と総合演習

## 前提

- Session 4 で商品登録・検索機能が完成していること
- `start/` フォルダを作業フォルダにコピーしていること

---

## この演習で使う AI 機能

この演習では、以下の AI 機能を使い分けます。

| 機能           | 用途                                   | 操作                                                                                 |
| -------------- | -------------------------------------- | ------------------------------------------------------------------------------------ |
| チャット       | 既存コードの理解、影響範囲の分析       | GitHub Copilot: `Ctrl + Shift + I` / Cursor: `Ctrl + L`                              |
| インライン補完 | テスト・実装コードの入力               | Tab で受け入れ、Esc で拒否                                                           |

チャットでのコンテキスト参照：

| 記法           | 説明                                       | ツール         |
| -------------- | ------------------------------------------ | -------------- |
| `@workspace`   | プロジェクト全体を参照                     | GitHub Copilot |
| `@ファイル名`  | 特定のファイルを参照                       | 両方           |

---

## start フォルダの内容

`start/` フォルダには、Session 4 までの完成物が含まれています：

| ファイル/フォルダ          | 内容                                   |
| -------------------------- | -------------------------------------- |
| `docs/*.md`                | 要件定義書・設計書                     |
| `src/models/*.ts`          | 型定義ファイル                         |
| `src/services/*.ts`        | Service 層（実装済み）                 |
| `src/repositories/*.ts`    | Repository 層（実装済み）              |
| `src/routes/*.ts`          | API ルート（実装済み）                 |
| `src/index.ts`             | アプリケーションエントリポイント       |
| `tests/**/*.test.ts`       | テストファイル                         |
| `package.json`             | プロジェクト設定                       |

---

## 演習 1: 在庫アラート機能の追加（30 分）

この演習では、既存のコードに新機能を追加します。

### ステップ 1: AI に既存コードを理解させる

使用する AI 機能: **Chat**

チャットパネルを開き、以下のプロンプトを入力します。

**GitHub Copilot の場合：**

```
@workspace 現在のプロジェクト構成を説明してください。
特に、商品と在庫の関係、データの流れを教えてください。
```

**Cursor の場合：**

```
@productService.ts @inventoryService.ts
この 2 つの Service の関係を説明してください。
在庫アラート機能を追加する場合、どちらに実装すべきですか？
```

- **@workspace**: プロジェクト全体を参照する（GitHub Copilot）
- **@ファイル名**: 特定のファイルを参照する

### ステップ 2: TDD で実装する

使用する AI 機能: **インライン補完**

TDD の Red-Green-Refactor サイクルで実装を進めます。

**テストを書く（Red）**

```typescript
// tests/services/inventoryService.test.ts に追加
describe('getAlertProducts', () => {
  it('閾値以下の商品を返す', async () => {
    // Arrange
    mockRepository.findAll.mockResolvedValue([
      { productId: 1, quantity: 5, threshold: 10 },   // アラート対象
      { productId: 2, quantity: 15, threshold: 10 }, // 対象外
      { productId: 3, quantity: 10, threshold: 10 }, // 境界値（対象）
    ]);

    // Act
    const alerts = await service.getAlertProducts();

    // Assert
    expect(alerts).toHaveLength(2);
    expect(alerts.map(a => a.productId)).toEqual([1, 3]);
  });

  it('アラート対象がない場合、空配列を返す', async () => {
    mockRepository.findAll.mockResolvedValue([
      { productId: 1, quantity: 20, threshold: 10 },
    ]);

    const alerts = await service.getAlertProducts();

    expect(alerts).toHaveLength(0);
  });
});
```

- 境界値（threshold と同じ値）もテストに含める
- 空配列のケースもテストする

**実装する（Green）**

```typescript
// src/services/inventoryService.ts に追加
async getAlertProducts(): Promise<Inventory[]> {
  const inventories = await this.repository.findAll();
  return inventories.filter(inv => inv.quantity <= inv.threshold);
}
```

**リファクタリングする（Refactor）**

必要に応じてコードを整理します。

### ステップ 3: フロントエンドにアラート表示を追加する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
在庫アラート機能のフロントエンドを追加してください。

【機能】
・ヘッダーに「アラート」ナビゲーションを追加
・アラートがある場合はバッジで件数を表示
・アラート一覧をテーブルで表示

【API】
・GET /api/inventory/alerts
```

### ステップ 4: Playwright テストを追加する

使用する AI 機能: **Chat**

アラート機能の E2E テストを作成します。

```sh
npm run test:e2e
```

---

## 演習 2: 発注管理機能の実装（30 分）

これまで学んだことを活かして、発注管理機能を実装します。

> **注意**: Order 型は Session 2 で既に定義済みです。

### ステップ 1: 要件を確認する

発注管理機能の要件：

| 機能 | 説明 |
| ---- | ---- |
| 発注作成 | 商品と数量を指定して発注を作成 |
| 発注一覧 | 発注の一覧を表示（ステータス別） |
| ステータス更新 | PENDING → ORDERED → RECEIVED の順で遷移 |
| 発注キャンセル | 発注をキャンセル |

ステータスの遷移：

```
PENDING（発注中）
    ├─→ ORDERED（発注済み）→ RECEIVED（入荷済み）→ 在庫を増やす
    └─→ CANCELLED（キャンセル）
```

### ステップ 2: テストを書く

使用する AI 機能: **インライン補完**

TDD で実装を進めます。まずテストを書きます。

```typescript
// tests/services/orderService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrderService } from '../../src/services/orderService';
import { OrderStatus } from '../../src/models/order';

describe('OrderService', () => {
  let mockOrderRepository: any;
  let mockInventoryService: any;
  let service: OrderService;

  beforeEach(() => {
    mockOrderRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
    };
    mockInventoryService = {
      updateQuantity: vi.fn(),
    };
    service = new OrderService(mockOrderRepository, mockInventoryService);
  });

  describe('create', () => {
    it('発注を作成できる', async () => {
      const input = { productId: 1, quantity: 10 };

      mockOrderRepository.save.mockResolvedValue({
        id: 1,
        productId: 1,
        quantity: 10,
        status: OrderStatus.PENDING,
        createdAt: new Date(),
      });

      const order = await service.create(input);

      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.productId).toBe(1);
      expect(order.quantity).toBe(10);
    });
  });

  describe('receive', () => {
    it('入荷処理で在庫が増える', async () => {
      const order = {
        id: 1,
        productId: 1,
        quantity: 10,
        status: OrderStatus.ORDERED,
      };

      mockOrderRepository.findById.mockResolvedValue(order);
      mockOrderRepository.update.mockResolvedValue({
        ...order,
        status: OrderStatus.RECEIVED,
        receivedAt: new Date(),
      });
      mockInventoryService.updateQuantity.mockResolvedValue({});

      const result = await service.receive(1);

      expect(result.status).toBe(OrderStatus.RECEIVED);
      expect(mockInventoryService.updateQuantity).toHaveBeenCalledWith(1, 'IN', 10);
    });

    it('ORDERED 以外の発注は入荷処理できない', async () => {
      mockOrderRepository.findById.mockResolvedValue({
        id: 1,
        status: OrderStatus.PENDING,
      });

      await expect(service.receive(1)).rejects.toThrow(
        '発注済みの発注のみ入荷処理できます'
      );
    });
  });
});
```

### ステップ 3: Service を実装する

使用する AI 機能: **インライン補完**

テストが通るように実装を進めます。

```typescript
// src/services/orderService.ts
import { Order, OrderInput, OrderStatus } from '../models/order';

export class OrderService {
  constructor(
    private orderRepository: any,
    private inventoryService: any
  ) {}

  async create(input: OrderInput): Promise<Order> {
    return this.orderRepository.save({
      ...input,
      status: OrderStatus.PENDING,
    });
  }

  async order(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('発注が見つかりません');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new Error('発注中の発注のみ発注済みにできます');
    }

    return this.orderRepository.update(orderId, {
      status: OrderStatus.ORDERED,
      orderedAt: new Date(),
    });
  }

  async receive(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('発注が見つかりません');
    }

    if (order.status !== OrderStatus.ORDERED) {
      throw new Error('発注済みの発注のみ入荷処理できます');
    }

    // 在庫を更新
    await this.inventoryService.updateQuantity(
      order.productId,
      'IN',
      order.quantity
    );

    return this.orderRepository.update(orderId, {
      status: OrderStatus.RECEIVED,
      receivedAt: new Date(),
    });
  }

  async cancel(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new Error('発注が見つかりません');
    }

    if (order.status === OrderStatus.RECEIVED) {
      throw new Error('入荷済みの発注はキャンセルできません');
    }

    return this.orderRepository.update(orderId, {
      status: OrderStatus.CANCELLED,
    });
  }
}
```

### ステップ 4: API を実装する

使用する AI 機能: **Chat** または **インライン補完**

Routes を追加して API を完成させます。

完成したら、`goal/` フォルダの完成例と見比べて確認してください。
