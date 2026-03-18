"""発注シリアライザー"""
from rest_framework import serializers
from inventory.models.order import Order


class OrderSerializer(serializers.ModelSerializer):
    """発注シリアライザー"""

    class Meta:
        model = Order
        fields = ['id', 'product_id', 'quantity', 'status', 'ordered_at', 'received_at', 'created_at']
