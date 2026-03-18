"""商品バリデーター"""
from dataclasses import dataclass, field
from typing import List

from .dto import ProductInput


@dataclass
class ValidationResult:
    """バリデーション結果"""
    is_valid: bool = True
    errors: List[str] = field(default_factory=list)

    def add_error(self, message: str):
        """エラーを追加"""
        self.is_valid = False
        self.errors.append(message)


class ProductValidator:
    """商品のバリデーション"""

    def validate(self, input_data: ProductInput) -> ValidationResult:
        """入力データを検証"""
        result = ValidationResult()

        # 商品名のバリデーション
        if not input_data.name:
            result.add_error("商品名は必須です")
        elif len(input_data.name) > 100:
            result.add_error("商品名は100文字以内で入力してください")

        # カテゴリのバリデーション
        if input_data.category is None:
            result.add_error("カテゴリは必須です")

        # 価格のバリデーション
        if input_data.price < 0:
            result.add_error("価格は0以上で入力してください")

        return result
