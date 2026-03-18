"""商品リポジトリ"""
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
