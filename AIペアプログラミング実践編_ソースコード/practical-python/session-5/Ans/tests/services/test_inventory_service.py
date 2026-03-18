"""InventoryService のテスト"""
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

    def test_update_quantity_out_decreases_quantity(self, service, mock_repository):
        """出庫で在庫数が減る"""
        # Arrange
        inventory = Inventory(product_id=1, quantity=10, threshold=5)
        mock_repository.find_by_id.return_value = inventory
        mock_repository.save.side_effect = lambda x: x

        # Act
        result = service.update_quantity(
            product_id=1,
            transaction_type=TransactionType.OUT,
            quantity=5
        )

        # Assert
        assert result.quantity == 5

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

    def test_update_quantity_product_not_found_raises_exception(
        self, service, mock_repository
    ):
        """存在しない商品IDの場合、例外を投げる"""
        # Arrange
        mock_repository.find_by_id.return_value = None

        # Act & Assert
        with pytest.raises(ValueError):
            service.update_quantity(
                product_id=999,
                transaction_type=TransactionType.IN,
                quantity=5
            )

    def test_update_quantity_zero_quantity_raises_exception(
        self, service, mock_repository
    ):
        """数量が0以下の場合、例外を投げる"""
        # Arrange
        inventory = Inventory(product_id=1, quantity=10, threshold=5)
        mock_repository.find_by_id.return_value = inventory

        # Act & Assert
        with pytest.raises(ValueError):
            service.update_quantity(
                product_id=1,
                transaction_type=TransactionType.IN,
                quantity=0
            )
