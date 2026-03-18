"""発注サービス"""
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
