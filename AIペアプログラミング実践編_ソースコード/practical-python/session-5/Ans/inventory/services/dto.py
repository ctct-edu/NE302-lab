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


@dataclass
class OrderInput:
    """発注作成時の入力データ"""
    product_id: int
    quantity: int

    def __init__(
        self,
        product_id: int = 0,
        quantity: int = 0
    ):
        self.product_id = product_id
        self.quantity = quantity
