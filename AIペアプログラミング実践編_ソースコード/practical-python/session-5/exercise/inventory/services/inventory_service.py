"""在庫サービス"""
from inventory.models.inventory import Inventory
from inventory.models.transaction import TransactionType


class InventoryService:
    """在庫のビジネスロジック"""

    def __init__(self, repository=None):
        self.repository = repository

    def update_quantity(
        self,
        product_id: int,
        transaction_type: TransactionType,
        quantity: int
    ) -> Inventory:
        """在庫数量を更新"""
        # 在庫を取得
        inventory = self.repository.find_by_id(product_id)
        if inventory is None:
            raise ValueError(f"在庫情報が見つかりません: {product_id}")

        # 数量の検証
        if quantity <= 0:
            raise ValueError("数量は1以上で入力してください")

        # 在庫の更新
        if transaction_type == TransactionType.IN:
            inventory.quantity += quantity
        else:
            new_quantity = inventory.quantity - quantity
            if new_quantity < 0:
                raise ValueError("在庫が不足しています")
            inventory.quantity = new_quantity

        # 保存
        return self.repository.save(inventory)

    def get_alert_products(self):
        """アラート対象の在庫を取得"""
        # TODO: 演習 1 で実装
        raise NotImplementedError("演習 1 で実装してください")
