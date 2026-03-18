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
