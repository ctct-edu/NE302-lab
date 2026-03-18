"""商品サービス"""
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

        # 保存
        return self.repository.save(product)

    def find_all(self):
        """全商品を取得"""
        return self.repository.find_all()

    def find_by_id(self, product_id: int) -> Product:
        """ID で商品を取得"""
        product = self.repository.find_by_id(product_id)
        if product is None:
            raise ValueError(f"商品が見つかりません: {product_id}")
        return product
