# 在庫管理システム 設計ドキュメント

## エンティティ一覧

### Product（商品）

| フィールド | 型              | 説明                |
| ---------- | --------------- | ------------------- |
| id         | Long            | 商品 ID（自動採番） |
| name       | String          | 商品名              |
| category   | ProductCategory | カテゴリ            |
| price      | Integer         | 単価（税抜）        |
| createdAt  | LocalDateTime   | 作成日時            |
| updatedAt  | LocalDateTime   | 更新日時            |

**ProductCategory:**

- STATIONERY: 文房具
- OFFICE: オフィス用品
- OTHER: その他

### Inventory（在庫）

| フィールド | 型            | 説明         |
| ---------- | ------------- | ------------ |
| productId  | Long          | 商品 ID      |
| quantity   | Integer       | 現在の在庫数 |
| threshold  | Integer       | 発注閾値     |
| updatedAt  | LocalDateTime | 最終更新日時 |

### Transaction（入出庫履歴）

| フィールド | 型              | 説明                |
| ---------- | --------------- | ------------------- |
| id         | Long            | 履歴 ID（自動採番） |
| productId  | Long            | 商品 ID             |
| type       | TransactionType | 入庫/出庫           |
| quantity   | Integer         | 数量                |
| note       | String          | 備考                |
| createdAt  | LocalDateTime   | 登録日時            |

**TransactionType:**

- IN: 入庫
- OUT: 出庫

### Order（発注）

| フィールド | 型            | 説明                |
| ---------- | ------------- | ------------------- |
| id         | Long          | 発注 ID（自動採番） |
| productId  | Long          | 商品 ID             |
| quantity   | Integer       | 発注数量            |
| status     | OrderStatus   | ステータス          |
| orderedAt  | LocalDateTime | 発注日              |
| receivedAt | LocalDateTime | 入荷日              |
| createdAt  | LocalDateTime | 作成日時            |

**OrderStatus:**

- PENDING: 作成中
- ORDERED: 発注済み
- RECEIVED: 入荷済み
- CANCELLED: キャンセル

## ER 図

```mermaid
erDiagram
    products ||--|| inventories : has
    products ||--o{ transactions : records
    products ||--o{ orders : has

    products {
        bigint id PK
        varchar name
        enum category
        int price
        datetime created_at
        datetime updated_at
    }

    inventories {
        bigint product_id PK,FK
        int quantity
        int threshold
        datetime updated_at
    }

    transactions {
        bigint id PK
        bigint product_id FK
        enum type
        int quantity
        varchar note
        datetime created_at
    }

    orders {
        bigint id PK
        bigint product_id FK
        int quantity
        enum status
        datetime ordered_at
        datetime received_at
        datetime created_at
    }
```

## クラス図

```mermaid
classDiagram
    class Product {
        +Long id
        +String name
        +ProductCategory category
        +Integer price
        +LocalDateTime createdAt
        +LocalDateTime updatedAt
    }

    class ProductCategory {
        <<enumeration>>
        STATIONERY
        OFFICE
        OTHER
    }

    class Inventory {
        +Long productId
        +Integer quantity
        +Integer threshold
        +LocalDateTime updatedAt
    }

    class Transaction {
        +Long id
        +Long productId
        +TransactionType type
        +Integer quantity
        +String note
        +LocalDateTime createdAt
    }

    class TransactionType {
        <<enumeration>>
        IN
        OUT
    }

    class Order {
        +Long id
        +Long productId
        +Integer quantity
        +OrderStatus status
        +LocalDateTime orderedAt
        +LocalDateTime receivedAt
        +LocalDateTime createdAt
    }

    class OrderStatus {
        <<enumeration>>
        PENDING
        ORDERED
        RECEIVED
        CANCELLED
    }

    Product --> ProductCategory : uses
    Transaction --> TransactionType : uses
    Order --> OrderStatus : uses
```

## バリデーションルール

### Product

| フィールド | ルール                     |
| ---------- | -------------------------- |
| name       | 必須、1〜100 文字          |
| category   | ProductCategory のいずれか |
| price      | 必須、0 以上の整数         |

### Inventory

| フィールド | ルール                |
| ---------- | --------------------- |
| productId  | 必須、存在する商品 ID |
| quantity   | 0 以上の整数          |
| threshold  | 0 以上の整数          |

### Transaction

| フィールド | ルール                |
| ---------- | --------------------- |
| productId  | 必須、存在する商品 ID |
| type       | IN または OUT         |
| quantity   | 1 以上の整数          |
| note       | 500 文字以内（任意）  |

### Order

| フィールド | ルール                 |
| ---------- | ---------------------- |
| productId  | 必須、存在する商品 ID  |
| quantity   | 1 以上の整数           |
| status     | OrderStatus のいずれか |

## 状態遷移（Order）

```txt
PENDING → ORDERED（発注実行）
PENDING → CANCELLED（キャンセル）
ORDERED → RECEIVED（入荷）
ORDERED → CANCELLED（キャンセル）
```

RECEIVED, CANCELLED からは遷移不可。
