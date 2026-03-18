# 在庫管理システム 設計書

## 1. システム構成

### 1.1 アーキテクチャ

```txt
┌─────────────────────────────────────────────────────────────────┐
│                      Client (Browser)                            │
│                  HTML / CSS / JavaScript                         │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP
┌────────────────────────────▼────────────────────────────────────┐
│                    Spring Boot Server                            │
│  ┌────────────┐    ┌──────────┐    ┌──────────────┐            │
│  │ Controller │───▶│ Service  │───▶│  Repository  │            │
│  └────────────┘    └──────────┘    └──────────────┘            │
└────────────────────────────┬────────────────────────────────────┘
                             │ JPA / SQL
┌────────────────────────────▼────────────────────────────────────┐
│                         MySQL                                    │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 レイヤー構成

| レイヤー   | 責務                       | 例                           |
| ---------- | -------------------------- | ---------------------------- |
| Controller | HTTP リクエストの受付      | `POST /api/products`         |
| Service    | ビジネスロジック           | バリデーション、在庫計算     |
| Repository | データベースアクセス       | JPA クエリ、結果のマッピング |
| Entity     | データ構造の定義           | Product, Inventory エンティティ |

## 2. API 設計

### 2.1 商品 API

| メソッド | エンドポイント         | 説明           |
| -------- | ---------------------- | -------------- |
| GET      | /api/products          | 商品一覧取得   |
| GET      | /api/products/{id}     | 商品詳細取得   |
| GET      | /api/products/search   | 商品検索       |
| POST     | /api/products          | 商品登録       |
| PUT      | /api/products/{id}     | 商品更新       |
| DELETE   | /api/products/{id}     | 商品削除       |

### 2.2 在庫 API

| メソッド | エンドポイント               | 説明               |
| -------- | ---------------------------- | ------------------ |
| GET      | /api/inventory               | 在庫一覧取得       |
| GET      | /api/inventory/{productId}   | 商品別在庫取得     |
| GET      | /api/inventory/alerts        | アラート対象取得   |
| POST     | /api/inventory/in            | 入庫登録           |
| POST     | /api/inventory/out           | 出庫登録           |

### 2.3 発注 API

| メソッド | エンドポイント           | 説明           |
| -------- | ------------------------ | -------------- |
| GET      | /api/orders              | 発注一覧取得   |
| GET      | /api/orders/{id}         | 発注詳細取得   |
| POST     | /api/orders              | 発注作成       |
| PUT      | /api/orders/{id}/confirm | 発注確定       |
| PUT      | /api/orders/{id}/cancel  | 発注キャンセル |

## 3. 処理フロー

### 3.1 商品登録フロー

```txt
1. ユーザーが商品情報を入力
2. Controller が POST /api/products を受信
3. Service がバリデーションを実行
4. Repository が products テーブルに INSERT
5. Repository が inventories テーブルに初期レコード INSERT
6. 登録結果を返却
```

### 3.2 入庫・出庫フロー

```txt
1. ユーザーが商品 ID と数量を入力
2. Controller が POST /api/inventory/in or /out を受信
3. Service が在庫数をチェック（出庫時のみ）
4. Repository が inventories テーブルを UPDATE
5. Repository が transactions テーブルに履歴を INSERT
6. 更新結果を返却
```
