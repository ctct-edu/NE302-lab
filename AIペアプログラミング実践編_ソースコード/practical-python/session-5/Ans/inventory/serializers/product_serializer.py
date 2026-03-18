"""商品シリアライザー"""
from rest_framework import serializers
from inventory.models.product import Product


class ProductSerializer(serializers.ModelSerializer):
    """商品シリアライザー"""

    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'price', 'created_at', 'updated_at']
