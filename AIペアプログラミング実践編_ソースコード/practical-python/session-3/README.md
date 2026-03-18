# Session 3: テストコード実装

## 前提

- Session 2 でモデル設計・データベース設計が完成していること
- `exercise/` フォルダを作業フォルダにコピーしていること

---

## この演習で使う AI 機能

この演習では、以下の AI 機能を使い分けます。

| 機能           | 用途                                   | 操作                                                    |
| -------------- | -------------------------------------- | ------------------------------------------------------- |
| チャット       | テストケースの洗い出し、設計相談       | GitHub Copilot: `Ctrl + Shift + I` / Cursor: `Ctrl + L` |
| インライン補完 | テストコード・実装コードの入力         | Tab で受け入れ、Esc で拒否                              |

---

## exercise フォルダの内容

`exercise/` フォルダには、Session 2 までの完成物が含まれています：

| ファイル/フォルダ                  | 内容                                |
| ---------------------------------- | ----------------------------------- |
| `docs/requirements.md`             | 要件定義書（Session 1 で作成）      |
| `docs/design.md`                   | 設計書（Session 2 で作成）          |
| `inventory/models/*.py`            | モデル（Session 2 で作成）          |
| `tests/test_sample.py`             | サンプルテストファイル              |
| `requirements.txt`                 | パッケージ依存関係（pytest 設定済み）|

---

## 演習 1: テスト環境の確認（10 分）

この演習では、テスト環境が正しく動作することを確認します。

### ステップ 1: 依存パッケージをインストールする

ターミナルで以下のコマンドを実行します。

```sh
cd inventory-system
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### ステップ 2: テストを実行する

```sh
pytest
```

サンプルテストが通ることを確認します。

- `pytest` は Python の柔軟なテストフレームワーク
- `-v` オプションで詳細な出力を表示

### ステップ 3: テストファイルの構造を確認する

`tests/` フォルダ内のサンプルテストを開いて構造を確認します。

```python
# tests/test_sample.py
def test_one_plus_one_equals_two():
    """1 + 1 = 2 であることを確認"""
    assert 1 + 1 == 2
```

| 構文/関数                | 説明                                     |
| ------------------------ | ---------------------------------------- |
| `def test_xxx():`        | テスト関数（test_ で始まる）             |
| `assert`                 | 期待値と実際の値が等しいことを確認       |
| `pytest.raises()`        | 例外がスローされることを確認             |
| `@pytest.fixture`        | テストの前処理を定義                     |

---

## 演習 2: バリデーション関数のテスト（30 分）

この演習では、TDD（テスト駆動開発）の Red-Green-Refactor サイクルを体験します。

### TDD の Red-Green-Refactor サイクル

TDD では、以下の 3 つのステップを繰り返して開発を進めます：

| ステップ     | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| **Red**      | まず失敗するテストを書く（テストが赤くなる）           |
| **Green**    | テストが通る最小限の実装を書く（テストが緑になる）     |
| **Refactor** | コードを整理する（テストが緑のまま）                   |

この演習では、ステップ 1-2 で Red、ステップ 4 で Green を体験します。

### ステップ 1: 仕様からテストを生成する

使用する AI 機能: **Chat**

チャットパネルを開き、以下のプロンプトを入力します。

**入力するプロンプト：**

```
以下の仕様を満たすバリデーション関数のテストを pytest で作成してください。
実装はまだないので、テストだけ書いてください。

【クラス名】
ProductValidator

【メソッド】
validate(input: ProductInput) -> ValidationResult

【仕様】
・name は必須、1〜100 文字
・category は STATIONERY, OFFICE, OTHER のいずれか
・price は 0 以上の整数

【テストケース】
・正常系：有効な入力
・異常系：name が空、name が 100 文字超、price が負数 など
```

### ステップ 2: テストファイルを作成する

使用する AI 機能: **インライン補完**

`tests/services/test_product_validator.py` を作成します。

期待されるテストコード：

```python
# tests/services/test_product_validator.py
import pytest
from inventory.services.product_validator import ProductValidator, ValidationResult
from inventory.services.dto import ProductInput
from inventory.models.product import ProductCategory


class TestProductValidator:
    """ProductValidator のテスト"""

    @pytest.fixture
    def validator(self):
        """テスト用の Validator インスタンス"""
        return ProductValidator()

    def test_valid_input_returns_success(self, validator):
        """有効な入力の場合、バリデーションが成功する"""
        # Arrange（準備）
        input_data = ProductInput(
            name="ボールペン",
            category=ProductCategory.STATIONERY,
            price=120
        )

        # Act（実行）
        result = validator.validate(input_data)

        # Assert（検証）
        assert result.is_valid is True

    def test_empty_name_returns_error(self, validator):
        """name が空の場合、エラーを返す"""
        input_data = ProductInput(
            name="",
            category=ProductCategory.STATIONERY,
            price=120
        )

        result = validator.validate(input_data)

        assert result.is_valid is False
        assert "商品名は必須です" in result.errors

    def test_name_too_long_returns_error(self, validator):
        """name が 100 文字を超える場合、エラーを返す"""
        input_data = ProductInput(
            name="a" * 101,
            category=ProductCategory.STATIONERY,
            price=120
        )

        result = validator.validate(input_data)

        assert result.is_valid is False
        assert "商品名は100文字以内で入力してください" in result.errors

    def test_negative_price_returns_error(self, validator):
        """price が負数の場合、エラーを返す"""
        input_data = ProductInput(
            name="ボールペン",
            category=ProductCategory.STATIONERY,
            price=-100
        )

        result = validator.validate(input_data)

        assert result.is_valid is False
        assert "価格は0以上で入力してください" in result.errors
```

- **@pytest.fixture**: テストで使う共通のオブジェクトを定義
- **クラスベースのテスト**: 関連するテストをグループ化

### ステップ 3: テストを実行する（Red）

```sh
pytest tests/services/test_product_validator.py -v
```

実装がないので失敗することを確認します。「テストが失敗する」ことを確認してから実装に進みます。

### ステップ 4: 実装を作成する（Green）

使用する AI 機能: **Chat** または **インライン補完**

`inventory/services/product_validator.py` を作成して、テストが通るように実装します。まずは「テストが通る最小限の実装」を目指します。

---

## 演習 3: Service 層のテスト（40 分）

この演習では、Repository をモックして Service のロジックだけをテストします。

### ステップ 1: モックの作成を学ぶ

**モック**とは「本物の代わりに使う偽物」です。データベースにアクセスせずに Service のロジックをテストできます。

pytest-mock（または unittest.mock）の基本的な使い方：

```python
from unittest.mock import Mock, MagicMock, patch

# モックの作成
mock_repository = Mock()

# 戻り値の設定
mock_repository.save.return_value = saved_product

# 呼び出し回数の確認
mock_repository.save.assert_called_once()

# 引数の確認
mock_repository.save.assert_called_with(product)
```

### ステップ 2: ProductService のテストを作成する

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
ProductService のテストを pytest + unittest.mock で書いてください。
ProductRepository はモックを使います。

【テスト対象】
ProductService.create(input: ProductInput) -> Product

【モックの設定】
・mock_repository.save() は保存した Product を返す
```

期待されるテストコード：

```python
# tests/services/test_product_service.py
import pytest
from unittest.mock import Mock, MagicMock
from datetime import datetime

from inventory.services.product_service import ProductService
from inventory.services.dto import ProductInput
from inventory.models.product import Product, ProductCategory


class TestProductService:
    """ProductService のテスト"""

    @pytest.fixture
    def mock_repository(self):
        """モック Repository"""
        return Mock()

    @pytest.fixture
    def service(self, mock_repository):
        """テスト用の Service インスタンス"""
        return ProductService(repository=mock_repository)

    def test_create_success(self, service, mock_repository):
        """商品を登録できる"""
        # Arrange: モックの戻り値を設定
        saved_product = Product(
            id=1,
            name="ボールペン",
            category=ProductCategory.STATIONERY,
            price=120
        )
        mock_repository.save.return_value = saved_product

        # Act
        input_data = ProductInput(
            name="ボールペン",
            category=ProductCategory.STATIONERY,
            price=120
        )
        product = service.create(input_data)

        # Assert
        assert product.id == 1
        assert product.name == "ボールペン"
        mock_repository.save.assert_called_once()

    def test_create_validation_error_raises_exception(self, service, mock_repository):
        """バリデーションエラーの場合、例外を投げる"""
        # Arrange
        invalid_input = ProductInput(
            name="",  # 空の商品名
            category=ProductCategory.STATIONERY,
            price=120
        )

        # Act & Assert
        with pytest.raises(ValueError):
            service.create(invalid_input)

        mock_repository.save.assert_not_called()
```

- **Mock()**: モックオブジェクトを作成
- **return_value**: モックの戻り値を設定
- **assert_called_once()**: メソッドが 1 回呼ばれたことを検証
- **assert_not_called()**: メソッドが呼ばれていないことを検証

### ステップ 3: テストを実行する

```sh
pytest tests/services/ -v
```

テストが通ることを確認します。

---

## 演習 4: 在庫更新ロジックなど、残りの機能のテスト（40 分）

この演習では、在庫更新（入庫・出庫）のテストを作成します。

### ステップ 1: エッジケースを洗い出す

使用する AI 機能: **Chat**

以下のプロンプトを入力します。

**入力するプロンプト：**

```
在庫更新（入庫・出庫）のテストケースを洗い出してください。

【仕様】
・入庫: 在庫数を増やす
・出庫: 在庫数を減らす
・在庫数がマイナスになる場合はエラー

【特に確認したい】
・境界値（在庫 0 からの出庫など）
・異常系（存在しない商品の更新など）
```

期待される出力：

```
【正常系】
・入庫: 在庫 10 → 入庫 5 → 在庫 15
・出庫: 在庫 10 → 出庫 5 → 在庫 5

【境界値】
・在庫 0 から入庫 → 成功
・在庫 5 から出庫 5 → 在庫 0（成功）
・在庫 5 から出庫 6 → エラー（マイナスになる）

【異常系】
・存在しない商品 ID の更新 → エラー
・数量が 0 以下 → エラー
```

### ステップ 2: テストを作成して実行する

使用する AI 機能: **インライン補完**

洗い出したテストケースを元にテストを作成します。

```python
# tests/services/test_inventory_service.py
import pytest
from unittest.mock import Mock

from inventory.services.inventory_service import InventoryService
from inventory.models.inventory import Inventory
from inventory.models.transaction import TransactionType


class TestInventoryService:
    """InventoryService のテスト"""

    @pytest.fixture
    def mock_repository(self):
        """モック Repository"""
        return Mock()

    @pytest.fixture
    def service(self, mock_repository):
        """テスト用の Service インスタンス"""
        return InventoryService(repository=mock_repository)

    def test_update_quantity_in_increases_quantity(self, service, mock_repository):
        """入庫で在庫数が増える"""
        # Arrange
        inventory = Inventory(product_id=1, quantity=10, threshold=5)
        mock_repository.find_by_id.return_value = inventory
        mock_repository.save.side_effect = lambda x: x

        # Act
        result = service.update_quantity(
            product_id=1,
            transaction_type=TransactionType.IN,
            quantity=5
        )

        # Assert
        assert result.quantity == 15

    def test_update_quantity_out_insufficient_stock_raises_exception(
        self, service, mock_repository
    ):
        """出庫で在庫がマイナスになる場合、例外を投げる"""
        # Arrange
        inventory = Inventory(product_id=1, quantity=5, threshold=5)
        mock_repository.find_by_id.return_value = inventory

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            service.update_quantity(
                product_id=1,
                transaction_type=TransactionType.OUT,
                quantity=6
            )

        assert str(exc_info.value) == "在庫が不足しています"
```

完成したら、`Ans/` フォルダの完成例と見比べて確認してください。
