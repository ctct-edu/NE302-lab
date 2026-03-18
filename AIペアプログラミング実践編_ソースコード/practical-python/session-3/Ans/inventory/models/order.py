from django.db import models


class OrderStatus(models.TextChoices):
    """発注ステータス"""
    PENDING = 'PENDING', '発注中'
    ORDERED = 'ORDERED', '発注済み'
    RECEIVED = 'RECEIVED', '入荷済み'
    CANCELLED = 'CANCELLED', 'キャンセル'


class Order(models.Model):
    """発注情報"""
    product = models.ForeignKey(
        'Product',
        on_delete=models.CASCADE,
        verbose_name='商品'
    )
    quantity = models.PositiveIntegerField('発注数量')
    status = models.CharField(
        'ステータス',
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.PENDING
    )
    ordered_at = models.DateTimeField('発注日時', null=True, blank=True)
    received_at = models.DateTimeField('入荷日時', null=True, blank=True)
    created_at = models.DateTimeField('作成日時', auto_now_add=True)

    class Meta:
        db_table = 'orders'
        verbose_name = '発注'
        verbose_name_plural = '発注'

    def __str__(self):
        return f'発注#{self.id} {self.product.name}'
