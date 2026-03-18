from django.db import models


class ProductCategory(models.TextChoices):
    """商品カテゴリ"""
    STATIONERY = 'STATIONERY', '文房具'
    OFFICE = 'OFFICE', 'オフィス用品'
    OTHER = 'OTHER', 'その他'


class Product(models.Model):
    """商品マスタ"""
    name = models.CharField('商品名', max_length=100)
    category = models.CharField(
        'カテゴリ',
        max_length=20,
        choices=ProductCategory.choices,
        default=ProductCategory.OTHER
    )
    price = models.PositiveIntegerField('単価')
    created_at = models.DateTimeField('作成日時', auto_now_add=True)
    updated_at = models.DateTimeField('更新日時', auto_now=True)

    class Meta:
        db_table = 'products'
        verbose_name = '商品'
        verbose_name_plural = '商品'

    def __str__(self):
        return self.name
