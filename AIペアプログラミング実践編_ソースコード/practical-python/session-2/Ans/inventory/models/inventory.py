from django.db import models


class Inventory(models.Model):
    """在庫情報"""
    product = models.OneToOneField(
        'Product',
        on_delete=models.CASCADE,
        primary_key=True,
        verbose_name='商品'
    )
    quantity = models.PositiveIntegerField('在庫数', default=0)
    threshold = models.PositiveIntegerField('アラート閾値', default=10)
    updated_at = models.DateTimeField('更新日時', auto_now=True)

    class Meta:
        db_table = 'inventories'
        verbose_name = '在庫'
        verbose_name_plural = '在庫'

    def __str__(self):
        return f'{self.product.name}: {self.quantity}'
