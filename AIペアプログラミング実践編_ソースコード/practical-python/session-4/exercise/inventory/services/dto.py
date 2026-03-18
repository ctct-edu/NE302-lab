"""データ転送オブジェクト（DTO）"""
from dataclasses import dataclass
from typing import Optional

from inventory.models.product import ProductCategory


@dataclass
class ProductInput:
    """商品登録時の入力データ"""
    name: str
    category: ProductCategory
    price: int

    def __init__(
        self,
        name: str = "",
        category: Optional[ProductCategory] = None,
        price: int = 0
    ):
        self.name = name
        self.category = category
        self.price = price
