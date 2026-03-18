# Session 2: 設計レビューと詳細化

## 前提

- Session 1 で要件定義書と骨格設計が完成していること
- `exercise/` フォルダを作業フォルダにコピーしていること

---

## この演習で使う AI 機能

この演習では、主に **チャット（Chat パネル）** を使用します。AI と対話しながら設計をレビュー・詳細化します。

チャットパネルの開き方：

| ツール         | 操作                                                                              |
| -------------- | --------------------------------------------------------------------------------- |
| GitHub Copilot | サイドバーのチャットアイコン、または `Ctrl + Shift + I`（Mac: `Cmd + Shift + I`） |
| Cursor         | `Ctrl + L`（Mac: `Cmd + L`）                                                      |

---

## exercise フォルダの内容

`exercise/` フォルダには、Session 1 の完成物が含まれています：

| ファイル               | 内容                           |
| ---------------------- | ------------------------------ |
| `docs/requirements.md` | 要件定義書（Session 1 で作成） |
| `docs/design.md`       | 設計書（Session 1 で作成）     |

---

## 演習 1: AI による設計レビュー（15 分）

この演習では、Session 1 で作成した設計を AI にレビューしてもらいます。

### ステップ 1: 設計書をレビュー依頼する

使用する AI 機能: **Chat**

チャットパネルを開き、以下のプロンプトを入力します。

**入力するプロンプト：**

```
以下の設計を「拡張性」の観点でレビューしてください。

【設計内容】
（Session 1 で作成した設計を貼り付け）

【確認したいこと】
・将来、複数店舗対応する場合に大きな改修が必要か
・拡張性を高めるための改善案
```

AI にレビューを依頼する際は「観点」を明確に伝えると、具体的な指摘が返ってきます。

### ステップ 2: アンチパターンをチェックする

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
以下の設計について、アンチパターン（よくある設計ミス）がないかチェックしてください。

【特に確認したい観点】
・依存関係が複雑になりそうな箇所
・テストしにくい構造
・責務が曖昧なクラス
```

**アンチパターン**とは「やってはいけない設計」のことです。例：神クラス（何でもやるクラス）、循環参照、密結合など。

### ステップ 3: 指摘事項を反映する

AI の指摘を確認し、設計書を更新します。すべての指摘を反映する必要はありません。プロジェクトに合った指摘を選んで対応します。

---

## 演習 2: クラス設計（エンティティ定義）（20 分）

この演習では、JPA エンティティを作成します。

### ステップ 1: 商品（Product）のエンティティを定義する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
在庫管理システムの商品（Product）のエンティティを Java で定義してください。
Spring Data JPA を使用します。

【必要なフィールド】
・ID（自動採番）
・商品名
・カテゴリ
・単価
・作成日時
・更新日時
```

期待される出力：

```java
// src/main/java/com/example/inventory/entity/ProductCategory.java
package com.example.inventory.entity;

public enum ProductCategory {
    STATIONERY, OFFICE, OTHER
}
```

```java
// src/main/java/com/example/inventory/entity/Product.java
package com.example.inventory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;

    @Column(nullable = false)
    private Integer price;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // コンストラクタ、Getter、Setter
}
```

- **@Entity**: JPA エンティティであることを示すアノテーション
- **@Id**: 主キーを示すアノテーション
- **@GeneratedValue**: ID の自動採番方法を指定
- **@Enumerated**: enum のマッピング方法を指定

`src/main/java/com/example/inventory/entity/Product.java` としてファイルを保存します。

### ステップ 2: 在庫（Inventory）のエンティティを定義する

以下のエンティティを作成します。

```java
// src/main/java/com/example/inventory/entity/Inventory.java
package com.example.inventory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventories")
public class Inventory {
    @Id
    @Column(name = "product_id")
    private Long productId;

    @Column(nullable = false)
    private Integer quantity = 0;

    @Column(nullable = false)
    private Integer threshold = 10; // アラート閾値

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // コンストラクタ、Getter、Setter
}
```

- **productId** で商品と紐づける（外部キー）
- **threshold** は「この数以下になったらアラート」の閾値

### ステップ 3: 取引履歴（Transaction）のエンティティを定義する

使用する AI 機能: **Chat**

入庫・出庫の履歴を記録するエンティティを定義します。

**入力するプロンプト：**

```
在庫の入庫・出庫を記録する Transaction エンティティを Java で定義してください。
Spring Data JPA を使用します。

【必要な情報】
・ID
・商品 ID
・種類（入庫 or 出庫）
・数量
・実行日時
```

期待される出力：

```java
// src/main/java/com/example/inventory/entity/TransactionType.java
package com.example.inventory.entity;

public enum TransactionType {
    IN, OUT
}
```

```java
// src/main/java/com/example/inventory/entity/Transaction.java
package com.example.inventory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // コンストラクタ、Getter、Setter
}
```

### ステップ 4: 発注（Order）のエンティティを定義する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
発注（Order）のエンティティを Java で定義してください。
Spring Data JPA を使用します。

【必要なフィールド】
・ID（自動採番）
・商品 ID
・発注数量
・ステータス（PENDING / ORDERED / RECEIVED / CANCELLED）
・発注日時（オプション）
・入荷日時（オプション）
・作成日時
```

期待される出力：

```java
// src/main/java/com/example/inventory/entity/OrderStatus.java
package com.example.inventory.entity;

public enum OrderStatus {
    PENDING, ORDERED, RECEIVED, CANCELLED
}
```

```java
// src/main/java/com/example/inventory/entity/Order.java
package com.example.inventory.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Integer quantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "ordered_at")
    private LocalDateTime orderedAt;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // コンストラクタ、Getter、Setter
}
```

- **enum**: 取りうる値を列挙型として定義
- **1 発注 1 商品**: シンプルな設計で、商品ごとに発注を管理

---

## 演習 3: データベース設計（25 分）

この演習では、エンティティ定義を元に MySQL のテーブル定義を作成します。

### ステップ 1: テーブル定義を作成する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
以下のエンティティ定義に基づいて、MySQL のテーブル定義を作成してください。

【エンティティ定義】
（作成したエンティティを貼り付け）

【出力形式】
・CREATE TABLE 文
・主キー、外部キーの設定
・インデックスの提案
```

用語の説明：

| 用語                    | 説明                         |
| ----------------------- | ---------------------------- |
| 主キー（PRIMARY KEY）   | 各行を一意に識別する列       |
| 外部キー（FOREIGN KEY） | 他のテーブルを参照する列     |
| インデックス            | 検索を高速化するための仕組み |

### ステップ 2: SQL ファイルを作成する

`sql/create_tables.sql` として保存します。

```sh
mkdir sql
```

期待される出力：

```sql
CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('STATIONERY', 'OFFICE', 'OTHER') NOT NULL,
    price INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE inventories (
    product_id BIGINT PRIMARY KEY,
    quantity INT NOT NULL DEFAULT 0,
    threshold INT NOT NULL DEFAULT 10,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    type ENUM('IN', 'OUT') NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    status ENUM('PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    ordered_at TIMESTAMP NULL,
    received_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

- **BIGINT**: Java の Long 型に対応
- **AUTO_INCREMENT**: ID を自動で採番
- **TIMESTAMP DEFAULT CURRENT_TIMESTAMP**: 挿入時に現在日時を自動設定
- **ENUM**: 取りうる値を制限（Java の enum に対応）

### ステップ 3: Mermaid で ER 図を作成する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
以下のエンティティの ER 図を Mermaid 記法で作成してください。

【エンティティ】
・Product（id, name, category, price, created_at, updated_at）
・Inventory（product_id, quantity, threshold, updated_at）
・Transaction（id, product_id, type, quantity, created_at）
・Order（id, product_id, quantity, status, ordered_at, received_at, created_at）

【関連】
・Product : Inventory = 1 : 1
・Product : Transaction = 1 : *
・Product : Order = 1 : *
```

生成された Mermaid を `docs/design.md` に追加します。

### ステップ 4: 設計ドキュメントを完成させる

使用する AI 機能: **Chat**

AI が生成した ER 図とエンティティ定義をもとに、`docs/design.md` を完成させます。

設計ドキュメントに含める内容：

- システム構成（レイヤー構成）
- エンティティ一覧とフィールド説明
- ER 図（Mermaid）
- テーブル定義（SQL）

完成したら、`Ans/` フォルダの完成例と見比べて確認してください。
