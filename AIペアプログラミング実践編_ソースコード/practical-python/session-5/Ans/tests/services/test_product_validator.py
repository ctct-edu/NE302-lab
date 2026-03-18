"""ProductValidator のテスト"""
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
        input_data = ProductInput(
            name="ボールペン",
            category=ProductCategory.STATIONERY,
            price=120
        )

        result = validator.validate(input_data)

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

    def test_null_name_returns_error(self, validator):
        """name が None の場合、エラーを返す"""
        input_data = ProductInput(
            name=None,
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

    def test_null_category_returns_error(self, validator):
        """category が None の場合、エラーを返す"""
        input_data = ProductInput(
            name="ボールペン",
            category=None,
            price=120
        )

        result = validator.validate(input_data)

        assert result.is_valid is False
        assert "カテゴリは必須です" in result.errors
