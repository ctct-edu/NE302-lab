"""ProductService のテスト"""
import pytest
from unittest.mock import Mock

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
        # Arrange
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
            name="",
            category=ProductCategory.STATIONERY,
            price=120
        )

        # Act & Assert
        with pytest.raises(ValueError):
            service.create(invalid_input)

        mock_repository.save.assert_not_called()
