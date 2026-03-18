"""OrderService のテスト"""
import pytest
from unittest.mock import Mock

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

    def test_order_updates_status_to_ordered(self, service, mock_order_repository):
        """発注を発注済みに更新できる"""
        # Arrange
        order = Order(id=1, product_id=1, quantity=10, status=OrderStatus.PENDING)
        mock_order_repository.find_by_id.return_value = order
        mock_order_repository.save.side_effect = lambda x: x

        # Act
        result = service.order(1)

        # Assert
        assert result.status == OrderStatus.ORDERED
        assert result.ordered_at is not None

    def test_order_raises_exception_when_status_is_not_pending(
        self, service, mock_order_repository
    ):
        """PENDING 以外の発注は発注済みにできない"""
        # Arrange
        order = Order(id=1, status=OrderStatus.ORDERED)
        mock_order_repository.find_by_id.return_value = order

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            service.order(1)

        assert str(exc_info.value) == "発注中の発注のみ発注済みにできます"

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
        assert result.received_at is not None
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

    def test_cancel_pending_order(self, service, mock_order_repository):
        """発注をキャンセルできる"""
        # Arrange
        order = Order(id=1, status=OrderStatus.PENDING)
        mock_order_repository.find_by_id.return_value = order
        mock_order_repository.save.side_effect = lambda x: x

        # Act
        result = service.cancel(1)

        # Assert
        assert result.status == OrderStatus.CANCELLED

    def test_cancel_raises_exception_when_status_is_received(
        self, service, mock_order_repository
    ):
        """入荷済みの発注はキャンセルできない"""
        # Arrange
        order = Order(id=1, status=OrderStatus.RECEIVED)
        mock_order_repository.find_by_id.return_value = order

        # Act & Assert
        with pytest.raises(ValueError) as exc_info:
            service.cancel(1)

        assert str(exc_info.value) == "入荷済みの発注はキャンセルできません"
