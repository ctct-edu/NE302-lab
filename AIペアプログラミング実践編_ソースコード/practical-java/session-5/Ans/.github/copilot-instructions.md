# プロジェクト概要

このプロジェクトは、小規模文房具店向けの在庫管理システムです。

## 技術スタック

- 言語: Java 21
- フレームワーク: Spring Boot 3.x
- ORM: Spring Data JPA
- データベース: MySQL
- フロントエンド: HTML / CSS / JavaScript（UI ライブラリ不使用）
- テスト: JUnit 5（ユニットテスト）、Playwright（E2E テスト）

## コーディング規約

### 命名規則

- ファイル名: PascalCase（例: ProductService.java）
- クラス名: PascalCase（例: ProductService）
- メソッド名・変数名: camelCase（例: getProductById）
- 定数: UPPER_SNAKE_CASE（例: MAX_QUANTITY）
- パッケージ名: lowercase（例: com.example.inventory）
- Enum 値: UPPER_SNAKE_CASE（例: STATIONERY）

### ディレクトリ構成

- src/main/java/com/example/inventory/controller/: REST Controller 定義
- src/main/java/com/example/inventory/service/: ビジネスロジック
- src/main/java/com/example/inventory/repository/: データアクセス層（JPA）
- src/main/java/com/example/inventory/entity/: JPA エンティティ
- src/main/java/com/example/inventory/dto/: データ転送オブジェクト
- src/main/resources/static/: フロントエンドファイル
- src/test/java/: テストコード

### データベース

- Spring Data JPA を使用
- Repository インターフェースで CRUD 操作を定義
- @Query アノテーションでカスタムクエリを記述

### コードスタイル

- メソッドは小さく、単一責任に
- 早期リターンを活用
- コメントは「なぜ」を説明する（「何を」はコードで表現）
