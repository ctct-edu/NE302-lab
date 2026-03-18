from django.db import models


class TransactionType(models.TextChoices):
    """取引種別"""
    IN = 'IN', '入庫'
    OUT = 'OUT', '出庫'


class Transaction(models.Model):
    """取引履歴"""
    product = models.ForeignKey(
        'Product',
        on_delete=models.CASCADE,
        verbose_name='商品'
    )
    type = models.CharField(
        '種別',
        max_length=10,
        choices=TransactionType.choices
    )
    quantity = models.PositiveIntegerField('数量')
    created_at = models.DateTimeField('実行日時', auto_now_add=True)

    class Meta:
        db_table = 'transactions'
        verbose_name = '取引履歴'
        verbose_name_plural = '取引履歴'

    def __str__(self):
        return f'{self.product.name} {self.type} {self.quantity}'
