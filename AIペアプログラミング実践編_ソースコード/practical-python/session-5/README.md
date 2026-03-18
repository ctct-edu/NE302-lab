# Session 5: 機能拡張と総合演習

## 前提

- Session 4 で商品登録・検索機能が完成していること
- `exercise/` フォルダを作業フォルダにコピーしていること
- Node.js 20 以上がインストールされていること（Playwright TypeScript 実行用）

---

## この演習で使う AI 機能

この演習では、以下の AI 機能を使い分けます。

| 機能           | 用途                                   | 操作                                                                                 |
| -------------- | -------------------------------------- | ------------------------------------------------------------------------------------ |
| チャット       | 既存コードの理解、影響範囲の分析       | GitHub Copilot: `Ctrl + Shift + I` / Cursor: `Ctrl + L`                              |
| インライン補完 | テスト・実装コードの入力               | Tab で受け入れ、Esc で拒否                                                           |

チャットでのコンテキスト参照：

| 記法           | 説明                                       | ツール         |
| -------------- | ------------------------------------------ | -------------- |
| `@workspace`   | プロジェクト全体を参照                     | GitHub Copilot |
| `@ファイル名`  | 特定のファイルを参照                       | 両方           |

---

## exercise フォルダの内容

`exercise/` フォルダには、Session 4 までの完成物が含まれています：

| ファイル/フォルダ                  | 内容                                   |
| ---------------------------------- | -------------------------------------- |
| `docs/*.md`                        | 要件定義書・設計書                     |
| `inventory/models/*.py`            | モデル                                 |
| `inventory/services/*.py`          | Service 層（実装済み）                 |
| `inventory/views/*.py`             | API ビュー（実装済み）                 |
| `inventory/serializers/*.py`       | シリアライザー（実装済み）             |
| `tests/**/*.py`                    | テストファイル                         |
| `static/`                          | フロントエンドファイル                 |
| `requirements.txt`                 | パッケージ依存関係                     |

---

## 演習 1: 在庫アラート機能の追加（10 分）

この演習では、既存のコードに新機能を追加します。

### ステップ 1: AI に既存コードを理解させる

使用する AI 機能: **Chat**

チャットパネルを開き、以下のプロンプトを入力します。

**GitHub Copilot の場合：**

```
@workspace 現在のプロジェクト構成を説明してください。
特に、商品と在庫の関係、データの流れを教えてください。
```

**Cursor の場合：**

```
@product_service.py @inventory_service.py
この 2 つの Service の関係を説明してください。
在庫アラート機能を追加する場合、どちらに実装すべきですか？
```

- **@workspace**: プロジェクト全体を参照する（GitHub Copilot）
- **@ファイル名**: 特定のファイルを参照する

### ステップ 2: TDD で実装する

使用する AI 機能: **インライン補完**

TDD の Red-Green-Refactor サイクルで実装を進めます。

**テストを書く（Red）**

```python
# tests/services/test_inventory_service.py に追加
class TestGetAlertProducts:
    """get_alert_products のテスト"""

    @pytest.fixture
    def mock_repository(self):
        return Mock()

    @pytest.fixture
    def service(self, mock_repository):
        return InventoryService(repository=mock_repository)

    def test_returns_products_below_threshold(self, service, mock_repository):
        """閾値以下の在庫をアラート対象として返す"""
        # Arrange
        inventories = [
            Inventory(product_id=1, quantity=5, threshold=10),   # アラート対象（5 <= 10）
            Inventory(product_id=2, quantity=15, threshold=10),  # 対象外（15 > 10）
            Inventory(product_id=3, quantity=10, threshold=10),  # 境界値（10 <= 10）アラート対象
        ]
        mock_repository.find_all.return_value = inventories

        # Act
        alerts = service.get_alert_products()

        # Assert
        assert len(alerts) == 2
        assert any(inv.product_id == 1 for inv in alerts)
        assert any(inv.product_id == 3 for inv in alerts)

    def test_returns_empty_list_when_no_alerts(self, service, mock_repository):
        """アラート対象がない場合、空リストを返す"""
        # Arrange
        inventories = [
            Inventory(product_id=1, quantity=20, threshold=10),  # 対象外
        ]
        mock_repository.find_all.return_value = inventories

        # Act
        alerts = service.get_alert_products()

        # Assert
        assert len(alerts) == 0
```

- 境界値（threshold と同じ値）もテストに含める
- 空リストのケースもテストする

**実装する（Green）**

```python
# inventory/services/inventory_service.py に追加
def get_alert_products(self):
    """アラート対象の在庫を取得"""
    if self.repository:
        inventories = self.repository.find_all()
    else:
        inventories = list(Inventory.objects.all())

    return [
        inv for inv in inventories
        if inv.quantity <= inv.threshold
    ]
```

**リファクタリングする（Refactor）**

必要に応じてコードを整理します。

---

## 演習 2: 発注管理機能の実装（30 分）

これまで学んだことを活かして、発注管理機能を実装します。

> **注意**: Order モデルは Session 2 で既に定義済みです。

### ステップ 1: 要件を確認する

発注管理機能の要件：

| 機能 | 説明 |
| ---- | ---- |
| 発注作成 | 商品と数量を指定して発注を作成 |
| 発注一覧 | 発注の一覧を表示（ステータス別） |
| ステータス更新 | PENDING → ORDERED → RECEIVED の順で遷移 |
| 発注キャンセル | 発注をキャンセル |

ステータスの遷移：

```
PENDING（発注中）
    ├─→ ORDERED（発注済み）→ RECEIVED（入荷済み）→ 在庫を増やす
    └─→ CANCELLED（キャンセル）
```

### ステップ 2: テストを書く

使用する AI 機能: **インライン補完**

TDD で実装を進めます。まずテストを書きます。

```python
# tests/services/test_order_service.py
import pytest
from unittest.mock import Mock
from datetime import datetime

from inventory.services.order_service import OrderService
from inventory.services.dto import OrderInput
from inventory.models.order import Order, OrderStatus


class TestOrderService:
    """OrderService のテスト"""

    @pytest.fixture
    def mock_order_repository(self):
        return Mock()

    @pytest.fixture
    def mock_inventory_service(self):
        return Mock()

    @pytest.fixture
    def service(self, mock_order_repository, mock_inventory_service):
        return OrderService(
            repository=mock_order_repository,
            inventory_service=mock_inventory_service
        )

    def test_create_order(self, service, mock_order_repository):
        """発注を作成できる"""
        # Arrange
        input_data = OrderInput(product_id=1, quantity=10)
        saved_order = Order(
            id=1,
            product_id=1,
            quantity=10,
            status=OrderStatus.PENDING
        )
        mock_order_repository.save.return_value = saved_order

        # Act
        order = service.create(input_data)

        # Assert
        assert order.status == OrderStatus.PENDING
        assert order.product_id == 1
        assert order.quantity == 10

    def test_receive_updates_inventory(
        self, service, mock_order_repository, mock_inventory_service
    ):
        """入荷処理で在庫が増える"""
        # Arrange
        order = Order(id=1, product_id=1, quantity=10, status=OrderStatus.ORDERED)
        mock_order_repository.find_by_id.return_value = order
        mock_order_repository.save.side_effect = lambda x: x

        # Act
        result = service.receive(1)

        # Assert
        assert result.status == OrderStatus.RECEIVED
        mock_inventory_service.update_quantity.assert_called_once()

    def test_receive_raises_exception_when_status_is_not_ordered(
        self, service, mock_order_repository
    ):
        """ORDERED 以外の発注は入荷処理できない"""
        # Arrange
        order = Order(id=1, status=OrderStatus.PENDING)
        mock_order_repository.find_by_id.return_value = order

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            service.receive(1)

        assert str(exc_info.value) == "発注済みの発注のみ入荷処理できます"
```

### ステップ 3: Service を実装する

使用する AI 機能: **インライン補完**

テストが通るように実装を進めます。

```python
# inventory/services/order_service.py
from datetime import datetime

from inventory.models.order import Order, OrderStatus
from inventory.models.transaction import TransactionType

from .dto import OrderInput


class OrderService:
    """発注のビジネスロジック"""

    def __init__(self, repository=None, inventory_service=None):
        self.repository = repository
        self.inventory_service = inventory_service

    def create(self, input_data: OrderInput) -> Order:
        """発注を作成"""
        order = Order(
            product_id=input_data.product_id,
            quantity=input_data.quantity,
            status=OrderStatus.PENDING
        )

        if self.repository:
            return self.repository.save(order)
        else:
            order.save()
            return order

    def order(self, order_id: int) -> Order:
        """発注を発注済みに更新"""
        order = self._get_order(order_id)

        if order.status != OrderStatus.PENDING:
            raise ValueError("発注中の発注のみ発注済みにできます")

        order.status = OrderStatus.ORDERED
        order.ordered_at = datetime.now()

        if self.repository:
            return self.repository.save(order)
        else:
            order.save()
            return order

    def receive(self, order_id: int) -> Order:
        """入荷処理"""
        order = self._get_order(order_id)

        if order.status != OrderStatus.ORDERED:
            raise ValueError("発注済みの発注のみ入荷処理できます")

        # 在庫を更新
        if self.inventory_service:
            self.inventory_service.update_quantity(
                product_id=order.product_id,
                transaction_type=TransactionType.IN,
                quantity=order.quantity
            )

        order.status = OrderStatus.RECEIVED
        order.received_at = datetime.now()

        if self.repository:
            return self.repository.save(order)
        else:
            order.save()
            return order

    def cancel(self, order_id: int) -> Order:
        """発注をキャンセル"""
        order = self._get_order(order_id)

        if order.status == OrderStatus.RECEIVED:
            raise ValueError("入荷済みの発注はキャンセルできません")

        order.status = OrderStatus.CANCELLED

        if self.repository:
            return self.repository.save(order)
        else:
            order.save()
            return order

    def find_all(self):
        """全発注を取得"""
        if self.repository:
            return self.repository.find_all()
        return list(Order.objects.all())

    def find_by_status(self, status: OrderStatus):
        """ステータスで絞り込んで発注を取得"""
        if self.repository:
            return self.repository.find_by_status(status)
        return list(Order.objects.filter(status=status))

    def _get_order(self, order_id: int) -> Order:
        """発注を取得"""
        if self.repository:
            order = self.repository.find_by_id(order_id)
        else:
            order = Order.objects.filter(id=order_id).first()

        if order is None:
            raise ValueError("発注が見つかりません")

        return order
```

### ステップ 4: API を実装する

使用する AI 機能: **Chat** または **インライン補完**

View を追加して API を完成させます。

```python
# inventory/views/order_views.py
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from inventory.models.order import OrderStatus
from inventory.services.order_service import OrderService
from inventory.services.dto import OrderInput
from inventory.serializers.order_serializer import OrderSerializer


order_service = OrderService()


@api_view(['GET', 'POST'])
def order_list(request):
    """発注一覧・作成"""
    if request.method == 'GET':
        status_filter = request.query_params.get('status')
        if status_filter:
            orders = order_service.find_by_status(OrderStatus(status_filter))
        else:
            orders = order_service.find_all()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        try:
            input_data = OrderInput(
                product_id=request.data.get('product_id'),
                quantity=request.data.get('quantity')
            )
            order = order_service.create(input_data)
            serializer = OrderSerializer(order)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def order_action(request, pk, action):
    """発注ステータス更新"""
    try:
        if action == 'order':
            order = order_service.order(pk)
        elif action == 'receive':
            order = order_service.receive(pk)
        elif action == 'cancel':
            order = order_service.cancel(pk)
        else:
            return Response({'error': '無効なアクション'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = OrderSerializer(order)
        return Response(serializer.data)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
```

完成したら、`Ans/` フォルダの完成例と見比べて確認してください。

---

## チャレンジ: 時間に余裕がある場合（20 分）

以下の機能など、あったら便利そうな機能を考えて実装してみましょう。

- **在庫レポート**: 全商品の在庫状況をまとめて表示
- **発注の自動提案**: アラート対象の商品に対して発注を自動提案
- **履歴のエクスポート**: 入出庫履歴を CSV で出力
- **商品の編集・削除**: CRUD の残り機能
