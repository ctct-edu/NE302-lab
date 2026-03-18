# 在庫管理システム 設計書

## 技術スタック

| 技術                   | バージョン | 用途                     |
| ---------------------- | ---------- | ------------------------ |
| Python                 | 3.12       | プログラミング言語       |
| Django                 | 5.x        | Web フレームワーク       |
| Django REST Framework  | 3.x        | RESTful API 構築         |
| MySQL                  | 8.x        | データベース             |
| pytest                 | 8.x        | ユニットテスト           |
| Playwright (TypeScript) | latest     | E2E テスト               |

## ディレクトリ構成

```
inventory-system/
├── config/                  # Django プロジェクト設定
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── inventory/               # メインアプリケーション
│   ├── __init__.py
│   ├── models/              # Django モデル（データ定義）
│   │   ├── __init__.py
│   │   ├── product.py
│   │   ├── inventory.py
│   │   └── transaction.py
│   ├── services/            # ビジネスロジック
│   │   ├── __init__.py
│   │   ├── product_service.py
│   │   └── inventory_service.py
│   ├── serializers/         # シリアライザー（検証・変換）
│   │   ├── __init__.py
│   │   └── product_serializer.py
│   ├── views/               # API エンドポイント
│   │   ├── __init__.py
│   │   └── product_views.py
│   ├── urls.py
│   └── admin.py
├── tests/                   # テスト
│   ├── __init__.py
│   └── test_product_service.py
├── docs/                    # ドキュメント
├── manage.py
└── requirements.txt
```

## レイヤー構成

```
┌─────────────────────────────────────┐
│           View（API）               │  HTTP リクエスト/レスポンス
├─────────────────────────────────────┤
│          Serializer                 │  データ検証・変換
├─────────────────────────────────────┤
│           Service                   │  ビジネスロジック
├─────────────────────────────────────┤
│        Model（Django ORM）          │  データベースアクセス
└─────────────────────────────────────┘
```

### 各レイヤーの責務

| レイヤー   | 責務                                    |
| ---------- | --------------------------------------- |
| View       | HTTP リクエストの受付、レスポンスの返却 |
| Serializer | 入力データの検証、JSON 変換             |
| Service    | ビジネスロジックの実装                  |
| Model      | データベースとのやり取り                |

## 処理フロー例：商品登録

```
1. クライアント → POST /api/products/
2. View が Serializer でデータを検証
3. View が Service.create() を呼び出す
4. Service が Model.objects.create() でデータを保存
5. View が登録結果を JSON で返却
```
