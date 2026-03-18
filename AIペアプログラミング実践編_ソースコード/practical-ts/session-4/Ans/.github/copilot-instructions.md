# プロジェクト概要

このプロジェクトは、小規模文房具店向けの在庫管理システムです。

## 技術スタック

- 言語: TypeScript
- サーバーサイド: Node.js / Express.js
- データベース: MySQL（ORM 不使用、mysql2 パッケージを使用）
- フロントエンド: HTML / CSS / JavaScript（UI ライブラリ不使用）
- テスト: Vitest（ユニットテスト）、Playwright（E2E テスト）

## コーディング規約

### 命名規則

- ファイル名: camelCase（例: productService.ts）
- クラス名: PascalCase（例: ProductService）
- 関数名・変数名: camelCase（例: getProductById）
- 定数: UPPER_SNAKE_CASE（例: MAX_QUANTITY）
- インターフェース名: PascalCase、I プレフィックスなし（例: Product）
- Enum 値: UPPER_SNAKE_CASE（例: STATIONERY）

### ディレクトリ構成

- src/routes/: API ルート定義
- src/services/: ビジネスロジック
- src/repositories/: データアクセス層（SQL 発行）
- src/models/: 型定義（interface）
- src/utils/: ユーティリティ
- public/: フロントエンドファイル
- tests/services/: ユニットテスト
- tests/e2e/: E2E テスト

### データベース

- ORM は使用しない
- プレースホルダー（?）を使用して SQL インジェクション対策
- Repository 層で SQL を発行

### コードスタイル

- 関数は小さく、単一責任に
- 早期リターンを活用
- コメントは「なぜ」を説明する（「何を」はコードで表現）

## 型定義のルール

### エンティティの型

- src/models/ 配下に配置
- ファイル名は単数形（例: product.ts）
- interface 名は PascalCase（例: Product）
- 各フィールドに JSDoc コメントを付与

### 入力型

- エンティティ名 + Input（例: ProductInput）
- エンティティ名 + UpdateInput（例: ProductUpdateInput）
- UpdateInput は全フィールドをオプショナルに

### Enum

- 値は UPPER_SNAKE_CASE（例: STATIONERY）
- 文字列 Enum を使用（例: STATIONERY = 'STATIONERY'）

## データベース

### テーブル設計

- テーブル名は複数形のスネークケース（例: products）
- カラム名はスネークケース（例: created_at）
- 主キーは id（AUTO_INCREMENT）
- 外部キー制約を設定
- created_at, updated_at は DATETIME 型

### SQL

- ORM は使用しない
- プレースホルダー（?）を使用して SQL インジェクション対策
- Repository 層で SQL を発行

## テスト

### テストフレームワーク

- サーバーサイド: Vitest
- E2E: Playwright（セッション 4 以降で使用）

### テストファイルの配置

- tests/services/: Service 層のユニットテスト
- tests/repositories/: Repository 層のテスト（必要に応じて）
- tests/e2e/: E2E テスト

### テストの書き方

- AAA パターン（Arrange → Act → Assert）で記述
- テスト名は日本語で、何をテストしているか明確に
- describe でグループ化（正常系、異常系、境界値など）
- beforeEach で各テストの前に初期化

### モック

- Repository 層はモックして Service 層をテスト
- vi.fn() でモック関数を作成
- vi.mock() でモジュールをモック

### カバレッジ

- 重要なビジネスロジックは 80%以上を目標
- 数字より意味のあるテストを優先

## API 実装

### ルート定義

- src/routes/ 配下に配置
- ファイル名は xxxRoutes.ts（例: productRoutes.ts）
- Express Router を使用

### エンドポイント命名

- RESTful な命名規則に従う
- GET /api/products - 一覧取得
- GET /api/products/:id - 単体取得
- POST /api/products - 新規作成
- PUT /api/products/:id - 更新
- DELETE /api/products/:id - 削除

### レスポンス形式

- 成功時: { data: ... } または { products: [...] }
- エラー時: { error: "メッセージ" }
- ステータスコード: 200, 201, 400, 404, 500

## フロントエンド

### ファイル配置

- public/index.html - メイン HTML
- public/css/style.css - スタイルシート
- public/js/app.js - JavaScript

### 制約

- UI ライブラリは使用しない
- fetch API でサーバーと通信
- ES6+ の構文を使用

## E2E テスト

### ファイル配置

- tests/e2e/ 配下に配置
- ファイル名は xxx.spec.ts

### テストの書き方

- 各テストは独立して実行可能に
- 適切な待機処理（waitForSelector 等）を入れる
- アサーションは expect を使用
