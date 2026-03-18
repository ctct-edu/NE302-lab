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

## 演習 2: クラス設計（モデル定義）（20 分）

この演習では、Django モデルを作成します。

### ステップ 1: 商品（Product）のモデルを定義する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
在庫管理システムの商品（Product）のモデルを Django で定義してください。

【必要なフィールド】
・ID（自動採番）
・商品名
・カテゴリ
・単価
・作成日時
・更新日時
```

期待される出力：

```python
# inventory/models/product.py
from django.db import models


class ProductCategory(models.TextChoices):
    """商品カテゴリ"""
    STATIONERY = 'STATIONERY', '文房具'
    OFFICE = 'OFFICE', 'オフィス用品'
    OTHER = 'OTHER', 'その他'


class Product(models.Model):
    """商品マスタ"""
    name = models.CharField('商品名', max_length=100)
    category = models.CharField(
        'カテゴリ',
        max_length=20,
        choices=ProductCategory.choices,
        default=ProductCategory.OTHER
    )
    price = models.PositiveIntegerField('単価')
    created_at = models.DateTimeField('作成日時', auto_now_add=True)
    updated_at = models.DateTimeField('更新日時', auto_now=True)

    class Meta:
        db_table = 'products'
        verbose_name = '商品'
        verbose_name_plural = '商品'

    def __str__(self):
        return self.name
```

- **models.TextChoices**: Django の enum 相当（選択肢を定義）
- **models.CharField**: 文字列フィールド
- **models.PositiveIntegerField**: 正の整数フィールド
- **auto_now_add=True**: 作成時に自動で現在日時を設定
- **auto_now=True**: 更新時に自動で現在日時を設定

`inventory/models/product.py` としてファイルを保存します。

### ステップ 2: 在庫（Inventory）のモデルを定義する

以下のモデルを作成します。

```python
# inventory/models/inventory.py
from django.db import models


class Inventory(models.Model):
    """在庫情報"""
    product = models.OneToOneField(
        'Product',
        on_delete=models.CASCADE,
        primary_key=True,
        verbose_name='商品'
    )
    quantity = models.PositiveIntegerField('在庫数', default=0)
    threshold = models.PositiveIntegerField('アラート閾値', default=10)
    updated_at = models.DateTimeField('更新日時', auto_now=True)

    class Meta:
        db_table = 'inventories'
        verbose_name = '在庫'
        verbose_name_plural = '在庫'

    def __str__(self):
        return f'{self.product.name}: {self.quantity}'
```

- **OneToOneField**: 1対1 の関連（商品1つに対して在庫情報1つ）
- **on_delete=models.CASCADE**: 商品が削除されたら在庫情報も削除
- **primary_key=True**: product を主キーとして使用
- **threshold** は「この数以下になったらアラート」の閾値

### ステップ 3: 取引履歴（Transaction）のモデルを定義する

使用する AI 機能: **Chat**

入庫・出庫の履歴を記録するモデルを定義します。

**入力するプロンプト：**

```
在庫の入庫・出庫を記録する Transaction モデルを Django で定義してください。

【必要な情報】
・ID
・商品 ID
・種類（入庫 or 出庫）
・数量
・実行日時
```

期待される出力：

```python
# inventory/models/transaction.py
from django.db import models


class TransactionType(models.TextChoices):
    """取引種別"""
    IN = 'IN', '入庫'
    OUT = 'OUT', '出庫'


class Transaction(models.Model):
    """取引履歴"""
    product = models.ForeignKey(
        'Product',
        on_delete=models.CASCADE,
        verbose_name='商品'
    )
    type = models.CharField(
        '種別',
        max_length=10,
        choices=TransactionType.choices
    )
    quantity = models.PositiveIntegerField('数量')
    created_at = models.DateTimeField('実行日時', auto_now_add=True)

    class Meta:
        db_table = 'transactions'
        verbose_name = '取引履歴'
        verbose_name_plural = '取引履歴'

    def __str__(self):
        return f'{self.product.name} {self.type} {self.quantity}'
```

### ステップ 4: 発注（Order）のモデルを定義する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
発注（Order）のモデルを Django で定義してください。

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

```python
# inventory/models/order.py
from django.db import models


class OrderStatus(models.TextChoices):
    """発注ステータス"""
    PENDING = 'PENDING', '発注中'
    ORDERED = 'ORDERED', '発注済み'
    RECEIVED = 'RECEIVED', '入荷済み'
    CANCELLED = 'CANCELLED', 'キャンセル'


class Order(models.Model):
    """発注情報"""
    product = models.ForeignKey(
        'Product',
        on_delete=models.CASCADE,
        verbose_name='商品'
    )
    quantity = models.PositiveIntegerField('発注数量')
    status = models.CharField(
        'ステータス',
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING
    )
    ordered_at = models.DateTimeField('発注日時', null=True, blank=True)
    received_at = models.DateTimeField('入荷日時', null=True, blank=True)
    created_at = models.DateTimeField('作成日時', auto_now_add=True)

    class Meta:
        db_table = 'orders'
        verbose_name = '発注'
        verbose_name_plural = '発注'

    def __str__(self):
        return f'発注#{self.id} {self.product.name}'
```

- **TextChoices**: 選択肢を定義する Django の enum
- **null=True, blank=True**: オプションフィールド（空を許可）
- **1 発注 1 商品**: シンプルな設計で、商品ごとに発注を管理

---

## 演習 3: データベース設計（25 分）

この演習では、モデル定義を元に MySQL のテーブル定義を作成します。

### ステップ 1: テーブル定義を作成する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
以下のモデル定義に基づいて、MySQL のテーブル定義を作成してください。

【モデル定義】
（作成したモデルを貼り付け）

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
    price INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE inventories (
    product_id BIGINT PRIMARY KEY,
    quantity INT UNSIGNED NOT NULL DEFAULT 0,
    threshold INT UNSIGNED NOT NULL DEFAULT 10,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    type ENUM('IN', 'OUT') NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    status ENUM('PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    ordered_at TIMESTAMP NULL,
    received_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

- **BIGINT**: Python の int 型に対応（Django は BigAutoField をデフォルトで使用）
- **AUTO_INCREMENT**: ID を自動で採番
- **TIMESTAMP DEFAULT CURRENT_TIMESTAMP**: 挿入時に現在日時を自動設定
- **ENUM**: 取りうる値を制限（Django の TextChoices に対応）

> **Note**: Django では `python manage.py makemigrations && python manage.py migrate` でマイグレーションを実行できますが、SQL ファイルを手動で管理することも可能です。

### ステップ 3: Mermaid で ER 図を作成する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
以下のモデルの ER 図を Mermaid 記法で作成してください。

【モデル】
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

AI が生成した ER 図とモデル定義をもとに、`docs/design.md` を完成させます。

設計ドキュメントに含める内容：

- システム構成（レイヤー構成）
- モデル一覧とフィールド説明
- ER 図（Mermaid）
- テーブル定義（SQL）

完成したら、`Ans/` フォルダの完成例と見比べて確認してください。
