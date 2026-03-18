# Session 4: 機能実装とリファクタリング

## 前提

- Session 3 でテストコードが完成していること
- `exercise/` フォルダを作業フォルダにコピーしていること
- Node.js 20 以上がインストールされていること（Playwright TypeScript 実行用）

---

## この演習で使う AI 機能

この演習では、以下の AI 機能を使い分けます。

| 機能           | 用途                                   | 操作                                                    |
| -------------- | -------------------------------------- | ------------------------------------------------------- |
| チャット       | 実装方針の相談、コードレビュー         | GitHub Copilot: `Ctrl + Shift + I` / Cursor: `Ctrl + L` |
| インライン補完 | 実装コードの入力                       | Tab で受け入れ、Esc で拒否                              |

> **Chat で生成されたコードの扱い方**：Chat が提案するコードはそのままコピーするのではなく、内容を理解した上で自分のコードに取り込みましょう。必要に応じて修正を加えることも重要です。

---

## exercise フォルダの内容

`exercise/` フォルダには、Session 3 までの完成物が含まれています：

| ファイル/フォルダ                   | 内容                                |
| ----------------------------------- | ----------------------------------- |
| `docs/*.md`                         | 要件定義書・設計書                  |
| `inventory/models/*.py`             | モデル                              |
| `inventory/services/*.py`           | Service 層（Session 3 作成）        |
| `tests/services/test_*.py`          | テストファイル（Session 3 で作成）  |
| `requirements.txt`                  | パッケージ依存関係                  |

---

## 演習 1: Repository 層の実装（20 分）

この演習では、データの永続化を担う Repository 層を実装します。

### ステップ 1: Repository 層を確認する

Django ORM を直接使用することもできますが、テストしやすくするために Repository パターンを使用する場合：

```python
# inventory/repositories/product_repository.py
from inventory.models.product import Product


class ProductRepository:
    """商品リポジトリ"""

    def save(self, product: Product) -> Product:
        """商品を保存"""
        product.save()
        return product

    def find_by_id(self, product_id: int) -> Product | None:
        """ID で商品を取得"""
        return Product.objects.filter(id=product_id).first()

    def find_all(self):
        """全商品を取得"""
        return list(Product.objects.all())

    def find_by_name_containing(self, name: str):
        """商品名で部分一致検索"""
        return list(Product.objects.filter(name__icontains=name))
```

- **Django ORM**: `objects.filter()`, `objects.all()`, `save()` などが提供される
- **__icontains**: 大文字小文字を区別しない部分一致検索

---

## 演習 2: Service 層の実装（30 分）

この演習では、ビジネスロジックを含む Service 層を実装し、検索機能も追加します。

### ステップ 1: Service 層を実装する

使用する AI 機能: **Chat**

チャットパネルを開き、以下のプロンプトを入力します。

**入力するプロンプト：**

```
商品登録機能を実装してください。

【仕様】
・ProductInput を受け取る
・バリデーションを行う
・Django ORM を通じて DB に保存
・保存した Product を返す

【既存のテスト】
@test_product_service.py

このテストが通るように実装してください。
```

期待される実装：

```python
# inventory/services/product_service.py
from inventory.models.product import Product

from .dto import ProductInput
from .product_validator import ProductValidator


class ProductService:
    """商品のビジネスロジック"""

    def __init__(self, repository=None):
        self.repository = repository
        self.validator = ProductValidator()

    def create(self, input_data: ProductInput) -> Product:
        """商品を登録"""
        # バリデーション
        result = self.validator.validate(input_data)
        if not result.is_valid:
            raise ValueError(", ".join(result.errors))

        # 商品を作成
        product = Product(
            name=input_data.name,
            category=input_data.category,
            price=input_data.price
        )

        # 保存（Django ORM を直接使用する場合）
        if self.repository:
            return self.repository.save(product)
        else:
            product.save()
            return product

    def find_all(self):
        """全商品を取得"""
        if self.repository:
            return self.repository.find_all()
        return list(Product.objects.all())

    def find_by_id(self, product_id: int) -> Product:
        """ID で商品を取得"""
        if self.repository:
            product = self.repository.find_by_id(product_id)
        else:
            product = Product.objects.filter(id=product_id).first()

        if product is None:
            raise ValueError(f"商品が見つかりません: {product_id}")
        return product
```

- **依存性注入（DI）**: repository を引数で受け取ることで、テスト時にモックを注入可能
- テスト時は `Mock()` でモックを注入し、本番時は Django ORM が使われる

### ステップ 2: テストを実行する（Green）

```sh
pytest
```

すべてのテストが通ることを確認します。

### ステップ 3: 検索仕様を決める

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
商品検索機能を作ります。
以下の検索条件で検索できるようにしたいです。

・商品名（部分一致）
・カテゴリ（完全一致）
・価格帯（min〜max）

この検索機能の設計について相談させてください。
クエリパラメータの形式はどうすべきですか？
```

期待される AI の回答例：

```
クエリパラメータの形式は以下のようにするのが一般的です：

GET /api/products/search/?name=ボール&category=STATIONERY&min_price=100&max_price=500

【パラメータ】
- name: 部分一致検索（省略可）
- category: 完全一致（省略可）
- min_price: 最低価格（省略可、デフォルト 0）
- max_price: 最高価格（省略可、デフォルト制限なし）
```

### ステップ 4: 検索機能を実装する

使用する AI 機能: **インライン補完**

AI の提案を参考に、自分で実装を進めます。

期待される実装（Service 層）：

```python
# ProductService に追加
def search(
    self,
    name: str | None = None,
    category: str | None = None,
    min_price: int | None = None,
    max_price: int | None = None
):
    """商品を検索"""
    products = self.find_all()

    return [
        product for product in products
        if self._matches_criteria(product, name, category, min_price, max_price)
    ]

def _matches_criteria(
    self,
    product,
    name: str | None,
    category: str | None,
    min_price: int | None,
    max_price: int | None
) -> bool:
    """検索条件にマッチするか判定"""
    # 商品名（部分一致）
    if name and name not in product.name:
        return False

    # カテゴリ（完全一致）
    if category and product.category != category:
        return False

    # 価格帯
    if min_price is not None and product.price < min_price:
        return False
    if max_price is not None and product.price > max_price:
        return False

    return True
```

### ステップ 5: テストを追加して確認する

使用する AI 機能: **インライン補完**

検索機能のテストを追加し、動作を確認します。

```python
def test_search_by_name(self, service, mock_repository):
    """商品名で部分一致検索できる"""
    # Arrange
    product1 = Product(id=1, name="ボールペン", category=ProductCategory.STATIONERY, price=120)
    product2 = Product(id=2, name="消しゴム", category=ProductCategory.STATIONERY, price=80)
    mock_repository.find_all.return_value = [product1, product2]

    # Act
    result = service.search(name="ボール")

    # Assert
    assert len(result) == 1
    assert result[0].name == "ボールペン"
```

---

## 演習 3: Views 層の実装（20 分）

この演習では、Django REST Framework を使って REST API の Views 層を実装します。

### ステップ 1: View を作成する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
商品の REST API を実装してください。Django REST Framework を使用します。

【エンドポイント】
・POST /api/products/ - 商品登録
・GET /api/products/ - 商品一覧
・GET /api/products/{id}/ - 商品詳細
・GET /api/products/search/ - 商品検索
```

期待される実装：

```python
# inventory/views/product_views.py
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from inventory.models.product import Product, ProductCategory
from inventory.services.product_service import ProductService
from inventory.services.dto import ProductInput
from inventory.serializers.product_serializer import ProductSerializer


# Service のインスタンス（本番環境では DI コンテナを使用）
product_service = ProductService()


@api_view(['GET', 'POST'])
def product_list(request):
    """商品一覧・登録"""
    if request.method == 'GET':
        products = product_service.find_all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        try:
            input_data = ProductInput(
                name=request.data.get('name', ''),
                category=request.data.get('category'),
                price=request.data.get('price', 0)
            )
            product = product_service.create(input_data)
            serializer = ProductSerializer(product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def product_detail(request, pk):
    """商品詳細"""
    try:
        product = product_service.find_by_id(pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def product_search(request):
    """商品検索"""
    name = request.query_params.get('name')
    category = request.query_params.get('category')
    min_price = request.query_params.get('min_price')
    max_price = request.query_params.get('max_price')

    # 型変換
    min_price = int(min_price) if min_price else None
    max_price = int(max_price) if max_price else None

    products = product_service.search(
        name=name,
        category=category,
        min_price=min_price,
        max_price=max_price
    )
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)
```

Serializer も作成します：

```python
# inventory/serializers/product_serializer.py
from rest_framework import serializers
from inventory.models.product import Product


class ProductSerializer(serializers.ModelSerializer):
    """商品シリアライザー"""

    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'price', 'created_at', 'updated_at']
```

URL を設定します：

```python
# inventory/urls.py
from django.urls import path
from inventory.views import product_views

urlpatterns = [
    path('products/', product_views.product_list, name='product-list'),
    path('products/<int:pk>/', product_views.product_detail, name='product-detail'),
    path('products/search/', product_views.product_search, name='product-search'),
]
```

- **@api_view**: 関数ベースの API ビューを定義
- **Response**: JSON レスポンスを返す
- **request.data**: POST リクエストのボディ
- **request.query_params**: クエリパラメータ

### ステップ 2: 動作確認する

サーバーを起動します。

```sh
python manage.py runserver
```

別のターミナルで curl コマンドを実行して動作確認します。

```sh
# 商品登録
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -d '{"name": "ボールペン", "category": "STATIONERY", "price": 120}'

# 商品一覧
curl http://localhost:8000/api/products/

# 商品検索
curl "http://localhost:8000/api/products/search/?name=ボール"
```

### ステップ 3: エラーケースを確認する

バリデーションエラーが正しく返ることを確認します。

```sh
# 空の商品名でエラー
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -d '{"name": "", "category": "STATIONERY", "price": 120}'
```

期待されるレスポンス：

```json
{ "error": "商品名は必須です" }
```

---

## 演習 4: フロントエンド UI の生成（30 分）

この演習では、AI に商品一覧・登録画面を生成させます。

### ステップ 1: 画面仕様を AI に伝える

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
在庫管理システムのフロントエンド画面を作成してください。

【技術スタック】
・HTML / CSS / JavaScript（UI ライブラリは使用しない）
・fetch API で API サーバーと通信

【画面構成】
・ヘッダー：システム名、ナビゲーション
・メイン：商品一覧テーブル
・フッター：コピーライト

【機能】
・商品一覧の表示（テーブル形式）
・商品登録フォーム（モーダル）
・検索ボックス

【API エンドポイント】
・GET /api/products/（商品一覧取得）
・POST /api/products/（商品登録）
・GET /api/products/search/?name=xxx（商品検索）
```

### ステップ 2: 生成されたコードを配置する

使用する AI 機能: **インライン補完**

AI が生成した HTML / CSS / JavaScript を `static/` フォルダに配置します。

```
static/
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

### ステップ 3: 動作確認する

サーバーを起動してブラウザで確認します。

```sh
python manage.py runserver
```

ブラウザで `http://localhost:8000/static/index.html` を開き、以下を確認します：

- 商品一覧が表示される
- 商品登録フォームが動作する
- 検索ボックスで絞り込める

---

## 演習 5: Playwright テストの作成（20 分）

この演習では、AI に E2E テストを生成させます。

### ステップ 1: テストケースを AI に依頼する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
以下の画面操作に対する Playwright（TypeScript）の E2E テストを作成してください。

【画面】
商品一覧画面

【テストケース】
1. 初期表示で商品一覧テーブルが表示される
2. 「商品を追加」ボタンで登録モーダルが開く
3. 商品を登録すると一覧に追加される
```

### ステップ 2: テストを実行する

```sh
# 初回のみ
npm init -y
npm install -D @playwright/test
npx playwright install

# E2E テスト実行
npx playwright test
```

テストが通ることを確認します。

- Playwright はヘッドレスブラウザで実際の画面操作をシミュレートする
- `npx playwright test --ui` で UI モードを起動すると、テスト実行を視覚的に確認できる

完成したら、`Ans/` フォルダの完成例と見比べて確認してください。
