# 在庫管理システム 設計書

## 技術スタック

| 技術                  | バージョン | 用途                   |
| --------------------- | ---------- | ---------------------- |
| .NET                  | 8.0        | プラットフォーム       |
| ASP.NET Core Web API  | 8.0        | Web フレームワーク     |
| Entity Framework Core | 8.0        | ORM                    |
| MySQL                 | 8.0        | データベース           |
| xUnit                 | 2.7        | ユニットテスト         |
| Playwright            | latest     | E2E テスト             |

## ディレクトリ構成

```
Inventory.Api/
├── Controllers/          # HTTP リクエスト受付
├── Services/             # ビジネスロジック
├── Repositories/         # データベースアクセス
├── Entities/             # データ構造
├── Dtos/                 # データ転送オブジェクト
├── Data/                 # DbContext
├── Program.cs            # エントリーポイント
└── appsettings.json      # 設定ファイル

Inventory.Tests/
└── Services/             # サービス層のテスト

docs/
├── requirements.md       # 要件定義書
└── design.md             # 設計書
```

## レイヤー構成

```
┌─────────────────┐
│   Controller    │  ← HTTP リクエストを受け付ける
├─────────────────┤
│    Service      │  ← ビジネスロジックを処理する
├─────────────────┤
│   Repository    │  ← データベースとやり取りする
├─────────────────┤
│     Entity      │  ← データ構造を定義する
└─────────────────┘
```

### 各レイヤーの責務

| レイヤー   | 責務                                          | 例                      |
| ---------- | --------------------------------------------- | ----------------------- |
| Controller | HTTP リクエストを受け取り、Service を呼ぶ     | `POST /api/products`    |
| Service    | ビジネスロジック（検証、計算など）            | 在庫が足りるか確認      |
| Repository | データベースとのやり取り                      | INSERT, SELECT 文の実行 |
| Entity     | データの型定義                                | Product, Inventory      |

## 処理フロー例：商品登録

```
1. [Controller] POST /api/products リクエストを受け取る
2. [Controller] リクエストボディを ProductDto にバインド
3. [Controller] ProductService.Create(dto) を呼び出す
4. [Service] バリデーション（商品名が空でないか等）
5. [Service] Product エンティティを生成
6. [Service] ProductRepository.Save(product) を呼び出す
7. [Repository] DbContext 経由で INSERT を実行
8. [Controller] 201 Created を返す
```
